const fs = require("fs");
const fsp = fs.promises; // Node 10+
const path = require("path");
const { create: FlatCacheCreate } = require("flat-cache");
const { createHash } = require("crypto");

const debug = require("debug")("Eleventy:Fetch");

class AssetCache {
	#customFilename;

	constructor(url, cacheDirectory, options = {}) {
		let uniqueKey;
		if (
			(typeof url === "object" && typeof url.then === "function") ||
			(typeof url === "function" && url.constructor.name === "AsyncFunction")
		) {
			if(typeof options.formatUrlForDisplay !== "function") {
				throw new Error("When caching an arbitrary promise source, options.formatUrlForDisplay is required.");
			}

			uniqueKey = options.formatUrlForDisplay();
		} else {
			uniqueKey = url;
		}

		this.uniqueKey = uniqueKey;
		this.hash = AssetCache.getHash(uniqueKey, options.hashLength);
		this.cacheDirectory = cacheDirectory || ".cache";
		this.defaultDuration = "1d";
		this.options = options;

		// Compute the filename only once
		if (typeof this.options.filenameFormat === "function") {
			this.#customFilename = this.options.filenameFormat(uniqueKey, this.hash);

			if (typeof this.#customFilename !== "string") {
				throw new Error(`The provided cacheFilename callback function did not return a string.`);
			}

			if (typeof this.#customFilename.length === 0) {
				throw new Error(`The provided cacheFilename callback function returned an empty string.`);
			}

			// Ensure no illegal characters are present (Windows or Linux: forward/backslash, chevrons, colon, double-quote, pipe, question mark, asterisk)
			if (this.#customFilename.match(/([\/\\<>:"|?*]+?)/)) {
				const sanitizedFilename = this.#customFilename.replace(/[\/\\<>:"|?*]+/g, "");
				console.warn(
					`[AssetCache] Some illegal characters were removed from the cache filename: ${this.#customFilename} will be cached as ${sanitizedFilename}.`,
				);
				this.#customFilename = sanitizedFilename;
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
		return this._source;
	}

	set source(source) {
		this._source = source;
	}

	get hash() {
		return this._hash;
	}

	set hash(value) {
		if (value !== this._hash) {
			this._cacheLocationDirty = true;
		}

		this._hash = value;
	}

	get cacheDirectory() {
		return this._cacheDirectory;
	}

	set cacheDirectory(dir) {
		if (dir !== this._cacheDirectory) {
			this._cacheLocationDirty = true;
		}

		this._cacheDirectory = dir;
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
		if (!this._cache || this._cacheLocationDirty) {
			let cache = FlatCacheCreate({
				cacheId: this.cacheFilename,
				cacheDir: this.rootDir,
			});

			this._cache = cache;
		}
		return this._cache;
	}

	getDurationMs(duration = "0s") {
		let durationUnits = duration.substr(-1);
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

		let durationValue = parseInt(duration.substr(0, duration.length - 1), 10);
		return durationValue * durationMultiplier * 1000;
	}

	getCachedContentsPath(type = "buffer") {
		return `${this.cachePath}.${type}`;
	}

	async ensureDir() {
		if (this._dirEnsured) {
			return;
		}

		// make cacheDirectory if it does not exist.
		return fsp
			.mkdir(this.cacheDirectory, {
				recursive: true,
			})
			.then(() => {
				this._dirEnsured = true;
			});
	}

	async save(contents, type = "buffer") {
		if (this.options.dryRun) {
			debug("An attempt was made to save to the file system with `dryRun: true`. Skipping.");
			return;
		}

		await this.ensureDir();

		if (type === "json") {
			contents = JSON.stringify(contents);
		}

		let contentPath = this.getCachedContentsPath(type);

		// the contents must exist before the cache metadata are saved below
		await fsp.writeFile(contentPath, contents);
		debug(`Writing ${contentPath}`);

		this.cache.set(this.hash, {
			cachedAt: Date.now(),
			type: type,
		});

		this.cache.save(true);
	}

	async getCachedContents(type) {
		let contentPath = this.getCachedContentsPath(type);
		debug(`Fetching from cache ${contentPath}`);

		if (type === "json") {
			return require(contentPath);
		}

		return fsp.readFile(contentPath, type !== "buffer" ? "utf8" : null);
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

		// promise
		return this.getCachedContents(type);
	}

	isCacheValid(duration) {
		return this.needsToFetch(duration || this.defaultDuration) === false;
	}

	get cachedObject() {
		return this.cache.get(this.hash);
	}

	needsToFetch(duration) {
		if (!this.cachedObject) {
			// not cached
			return true;
		} else if (!duration || duration === "*") {
			// no duration specified (plugin default is 1d, but if this is falsy assume infinite)
			// "*" is infinite duration
			return false;
		}

		debug("Cache check for: %o %o (duration: %o)", this.hash, this.source, duration);
		debug("Cache object: %o", this.cachedObject);

		let compareDuration = this.getDurationMs(duration);
		let expiration = this.cachedObject.cachedAt + compareDuration;
		let expirationRelative = Math.abs(Date.now() - expiration);

		if (expiration > Date.now()) {
			debug("Cache okay, expires in %o s (%o)", expirationRelative / 1000, new Date(expiration));
			return false;
		}

		debug("Cache expired %o s ago (%o)", expirationRelative / 1000, new Date(expiration));
		return true;
	}

	async fetch(options) {
		if (this.isCacheValid(options.duration)) {
			// promise
			this.log(`Using cached version of: ${this.uniqueKey}`);
			return this.getCachedValue();
		}

		this.log(`Saving ${this.uniqueKey} to ${this.cacheFilename}`);
		await this.save(this.source, options.type);

		return this.source;
	}

	// for testing
	hasCacheFiles() {
		return fs.existsSync(this.cachePath) || fs.existsSync(this.getCachedContentsPath());
	}

	// for testing
	async destroy() {
		if (fs.existsSync(this.cachePath)) {
			await fsp.unlink(this.cachePath);
		}
		if (fs.existsSync(this.getCachedContentsPath())) {
			await fsp.unlink(this.getCachedContentsPath());
		}
	}
}
module.exports = AssetCache;
