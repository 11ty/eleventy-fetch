const fs = require("graceful-fs");
const path = require("path");
const { create: FlatCacheCreate } = require("flat-cache");
const { createHash } = require("crypto");
const debugUtil = require("debug");

const Sources = require("./Sources.js");
const DirectoryManager = require("./DirectoryManager.js");

const debug = debugUtil("Eleventy:Fetch");
const debugAssets = debugUtil("Eleventy:Assets");

class AssetCache {
	#source;
	#hash;
	#customFilename;
	#cache;
	#cacheDirectory;
	#cacheLocationDirty = false;
	#directoryManager;
	#rawContents = {}

	constructor(source, cacheDirectory, options = {}) {
		if(!Sources.isValidSource(source)) {
			throw Sources.getInvalidSourceError(source);
		}

		let uniqueKey = AssetCache.getCacheKey(source, options);
		this.uniqueKey = uniqueKey;
		this.hash = AssetCache.getHash(uniqueKey, options.hashLength);

		this.cacheDirectory = cacheDirectory || ".cache";
		this.options = options;

		this.defaultDuration = "1d";
		this.duration = options.duration || this.defaultDuration;

		// Compute the filename only once
		if (typeof this.options.filenameFormat === "function") {
			this.#customFilename = AssetCache.cleanFilename(this.options.filenameFormat(uniqueKey, this.hash));

			if (typeof this.#customFilename !== "string" || this.#customFilename.length === 0) {
				throw new Error(`The provided filenameFormat callback function needs to return valid filename characters.`);
			}
		}
	}

	log(message) {
		if (this.options.verbose) {
			console.log(`[11ty/eleventy-fetch] ${message}`);
		} else {
			debug(message);
		}
	}

	static cleanFilename(filename) {
		// Ensure no illegal characters are present (Windows or Linux: forward/backslash, chevrons, colon, double-quote, pipe, question mark, asterisk)
		if (filename.match(/([\/\\<>:"|?*]+?)/)) {
			let sanitizedFilename = filename.replace(/[\/\\<>:"|?*]+/g, "");
			debug(
				`[@11ty/eleventy-fetch] Some illegal characters were removed from the cache filename: ${filename} will be cached as ${sanitizedFilename}.`,
			);
			return sanitizedFilename;
		}

		return filename;
	}

	static getCacheKey(source, options) {
		// RemoteAssetCache passes in a string here, which skips this check (requestId is already used upstream)
		if (Sources.isValidComplexSource(source)) {
			if(options.requestId) {
				return options.requestId;
			}

			if(typeof source.toString === "function") {
				// 	return source.toString();
				let toStr = source.toString();
				if(toStr !== "function() {}" && toStr !== "[object Object]") {
					return toStr;
				}
			}

			throw Sources.getInvalidSourceError(source);
		}

		return source;
	}

	// Defult hashLength also set in global options, duplicated here for tests
	// v5.0+ key can be Array or literal
	static getHash(key, hashLength = 30) {
		let hash = createHash("sha256");

		if (!Array.isArray(key)) {
			key = [key];
		}

		for (let k of key) {
			k = "" + k;
			if (k) {
				hash.update(k);
			} else {
				throw new Error(`Not able to convert asset key (${k}) to string.`);
			}
		}

		return ("" + hash.digest("hex")).slice(0, hashLength);
	}

	get source() {
		return this.#source;
	}

	set source(source) {
		this.#source = source;
	}

	get hash() {
		return this.#hash;
	}

	set hash(value) {
		if (value !== this.#hash) {
			this.#cacheLocationDirty = true;
		}

		this.#hash = value;
	}

	get cacheDirectory() {
		return this.#cacheDirectory;
	}

	set cacheDirectory(dir) {
		if (dir !== this.#cacheDirectory) {
			this.#cacheLocationDirty = true;
		}

		this.#cacheDirectory = dir;
	}

	get cacheFilename() {
		if (typeof this.#customFilename === "string" && this.#customFilename.length > 0) {
			return this.#customFilename;
		}

		return `eleventy-fetch-${this.hash}`;
	}

	get rootDir() {
		// Work in an AWS Lambda (serverless)
		// https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html

		// Bad: LAMBDA_TASK_ROOT is /var/task/ on AWS so we must use ELEVENTY_ROOT
		// When using ELEVENTY_ROOT, cacheDirectory must be relative
		// (we are bundling the cache files into the serverless function)
		if (
			process.env.LAMBDA_TASK_ROOT &&
			process.env.ELEVENTY_ROOT &&
			!this.cacheDirectory.startsWith("/")
		) {
			return path.resolve(process.env.ELEVENTY_ROOT, this.cacheDirectory);
		}

		// otherwise, it is recommended to use somewhere in /tmp/ for serverless (otherwise it won’t write)
		return path.resolve(this.cacheDirectory);
	}

	get cachePath() {
		return path.join(this.rootDir, this.cacheFilename);
	}

	get cache() {
		if (!this.#cache || this.#cacheLocationDirty) {
			let cache = FlatCacheCreate({
				cacheId: this.cacheFilename,
				cacheDir: this.rootDir,
			});

			this.#cache = cache;
			this.#cacheLocationDirty = false;
		}
		return this.#cache;
	}

	getDurationMs(duration = "0s") {
		let durationUnits = duration.slice(-1);
		let durationMultiplier;
		if (durationUnits === "s") {
			durationMultiplier = 1;
		} else if (durationUnits === "m") {
			durationMultiplier = 60;
		} else if (durationUnits === "h") {
			durationMultiplier = 60 * 60;
		} else if (durationUnits === "d") {
			durationMultiplier = 60 * 60 * 24;
		} else if (durationUnits === "w") {
			durationMultiplier = 60 * 60 * 24 * 7;
		} else if (durationUnits === "y") {
			durationMultiplier = 60 * 60 * 24 * 365;
		}

		let durationValue = parseInt(duration.slice(0, duration.length - 1), 10);
		return durationValue * durationMultiplier * 1000;
	}

	getCachedContentsPath(type = "buffer") {
		if(type === "xml") {
			type = "text";
		} else if(type === "parsed-xml") {
			type = "json";
		}

		return `${this.cachePath}.${type}`;
	}

	setDirectoryManager(manager) {
		this.#directoryManager = manager;
	}

	ensureDir() {
		if (this.options.dryRun) {
			return;
		}

		if(!this.#directoryManager) {
			// standalone fallback (for tests)
			this.#directoryManager = new DirectoryManager();
		}

		this.#directoryManager.create(this.cacheDirectory);
	}

	async save(contents, type = "buffer", metadata = {}) {
		if(!contents) {
			throw new Error("save(contents) expects contents (was falsy)");
		}

		this.cache.set(this.hash, {
			cachedAt: Date.now(),
			type: type,
			metadata,
		});

		let contentPath = this.getCachedContentsPath(type);

		if (type === "json" || type === "parsed-xml") {
			contents = JSON.stringify(contents);
		}

		this.#rawContents[type] = contents;

		if(this.options.dryRun) {
			debug(`Dry run writing ${contentPath}`);
			return;
		}

		this.ensureDir();

		debugAssets("[11ty/eleventy-fetch] Writing %o from %o", contentPath, this.source);

		// the contents must exist before the cache metadata are saved below
		fs.writeFileSync(contentPath, contents);
		debug(`Writing ${contentPath}`);

		this.cache.save();
	}

	async #getCachedContents(type) {
		let contentPath = this.getCachedContentsPath(type);

		debug(`Fetching from cache ${contentPath}`);

		if(this.source) {
			debugAssets("[11ty/eleventy-fetch] Reading via %o", this.source);
		} else {
			debugAssets("[11ty/eleventy-fetch] Reading %o", contentPath);
		}

		if (type === "json" || type === "parsed-xml") {
			return require(contentPath);
		}

		return fs.readFileSync(contentPath, type !== "buffer" ? "utf8" : null);
	}

	async getCachedContents(type) {
		if(!this.#rawContents[type]) {
			this.#rawContents[type] = this.#getCachedContents(type);
		}

		// already saved on this instance in-memory
		return this.#rawContents[type];
	}

	_backwardsCompatibilityGetCachedValue(type) {
		if (type === "json") {
			return this.cachedObject.contents;
		} else if (type === "text") {
			return this.cachedObject.contents.toString();
		}

		// buffer
		return Buffer.from(this.cachedObject.contents);
	}

	async getCachedValue() {
		let type = this.cachedObject.type;

		// backwards compat with old caches
		if (this.cachedObject.contents) {
			return this._backwardsCompatibilityGetCachedValue(type);
		}

		if(this.options.returnType === "response") {
			return {
				...this.cachedObject.metadata?.response,
				body: await this.getCachedContents(type),
				cache: "hit",
			}
		}

		// promise
		return this.getCachedContents(type);
	}

	getCachedTimestamp() {
		return this.cachedObject?.cachedAt;
	}

	isCacheValid(duration = this.duration) {
		if (!this.cachedObject) {
			// not cached
			return false;
		}

		// in the cache and no duration
		if (!duration || duration === "*") {
			// no duration specified (plugin default is 1d, but if this is falsy assume infinite)
			// "*" is infinite duration
			return true;
		}

		debug("Cache check for: %o %o (duration: %o)", this.hash, this.source, duration);
		debug("Cache object: %o", this.cachedObject);

		let compareDuration = this.getDurationMs(duration);
		let expiration = this.cachedObject.cachedAt + compareDuration;
		let expirationRelative = Math.abs(Date.now() - expiration);

		if (expiration > Date.now()) {
			debug("Cache okay, expires in %o s (%o)", expirationRelative / 1000, new Date(expiration));
			return true;
		}

		debug("Cache expired %o s ago (%o)", expirationRelative / 1000, new Date(expiration));
		return false;
	}

	get cachedObject() {
		return this.cache.get(this.hash);
	}

	// Deprecated
	needsToFetch(duration) {
		return !this.isCacheValid(duration);
	}

	// This is only included for completenes—not on the docs.
	async fetch(optionsOverride = {}) {
		if (this.isCacheValid(optionsOverride.duration)) {
			// promise
			debug(`Using cached version of: ${this.uniqueKey}`);
			return this.getCachedValue();
		}

		debug(`Saving ${this.uniqueKey} to ${this.cacheFilename}`);
		await this.save(this.source, optionsOverride.type);

		return this.source;
	}

	// for testing
	hasCacheFiles() {
		return fs.existsSync(this.cachePath) || fs.existsSync(this.getCachedContentsPath());
	}

	// for testing
	async destroy() {
		let paths = [];
		paths.push(this.cachePath);
		paths.push(this.getCachedContentsPath("json"));
		paths.push(this.getCachedContentsPath("text"));
		paths.push(this.getCachedContentsPath("buffer"));

		await Promise.all(paths.map(path => {
			if (fs.existsSync(path)) {
				return fs.unlinkSync(path);
			}
		}))
	}
}
module.exports = AssetCache;
