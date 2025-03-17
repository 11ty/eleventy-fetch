const fs = require("node:fs");
const path = require("node:path");
const debugUtil = require("debug");
const { parse } = require("flatted");

const debug = debugUtil("Eleventy:Fetch");
const debugAssets = debugUtil("Eleventy:Assets");

const DirectoryManager = require("./DirectoryManager.js");
const ExistsCache = require("./ExistsCache.js");

let existsCache = new ExistsCache();

class FileCache {
	#source;
	#directoryManager;
	#metadata;
	#contents;
	#dryRun = false;
	#cacheDirectory = ".cache";
	#savePending = false;
	#counts = {
		read: 0,
		write: 0,
	};

	constructor(cacheFilename, options = {}) {
		this.cacheFilename = cacheFilename;
		if(options.dir) {
			this.#cacheDirectory = options.dir;
		}
		if(options.source) {
			this.#source = options.source;
		}
	}

	setDryRun(val) {
		this.#dryRun = Boolean(val);
	}

	setDirectoryManager(manager) {
		this.#directoryManager = manager;
	}

	ensureDir() {
		if (this.#dryRun || existsCache.exists(this.#cacheDirectory)) {
			return;
		}

		if(!this.#directoryManager) {
			// standalone fallback (for tests)
			this.#directoryManager = new DirectoryManager();
		}

		this.#directoryManager.create(this.#cacheDirectory);
	}

	isSideLoaded() {
		return this.#metadata?.type === "buffer";
	}

	set(type, contents, extraMetadata = {}) {
		this.#savePending = true;

		this.#metadata = {
			cachedAt: Date.now(),
			type,
			// source: this.#source,
			metadata: extraMetadata,
		};

		this.#contents = contents;
	}

	get fsPath() {
		return path.join(this.#cacheDirectory, this.cacheFilename);
	}

	// only when side loaded (buffer content)
	get contentsPath() {
		return `${this.fsPath}.buffer`;
	}

	get() {
		if(this.#metadata) {
			return this.#metadata;
		}

		if(!existsCache.exists(this.fsPath)) {
			return;
		}

		debug(`Fetching from cache ${this.contentsPath}`);
		if(this.#source) {
			debugAssets("[11ty/eleventy-fetch] Reading via %o", this.#source);
		} else {
			debugAssets("[11ty/eleventy-fetch] Reading %o", this.contentsPath);
		}

		this.#counts.read++;
		let data = fs.readFileSync(this.fsPath, "utf8");

		let json;
		// Backwards compatibility with previous caches usingn flat-cache and `flatted`
		if(data.startsWith(`[["1"],`)) {
			let flattedParsed = parse(data);
			if(flattedParsed?.[0]?.value) {
				json = flattedParsed?.[0]?.value
			}
		} else {
			json = JSON.parse(data);
		}

		this.#metadata = json;

		if(json.data) { // not side-loaded
			this.#contents = json.data;
		}

		return json;
	}

	_backwardsCompatGetContents(rawData, type) {
		if (type === "json") {
			return rawData.contents;
		} else if (type === "text") {
			return rawData.contents.toString();
		}

		// buffer
		return Buffer.from(rawData.contents);
	}

	getContents() {
		if(this.#contents) {
			return this.#contents;
		}

		// Side loaded contents are embedded inside, but we check (for backwards compat)
		if(!this.isSideLoaded() && this.get()?.data) {
			return this.get()?.data;
		} else if(this.get()?.contents) {
			// backwards compat with old caches
			let normalizedContent = this._backwardsCompatGetContents(this.get(), this.#metadata.type);
			this.#contents = normalizedContent; // set cache
			return normalizedContent;
		}

		if(!existsCache.exists(this.contentsPath)) {
			return;
		}

		debug(`Fetching from cache ${this.contentsPath}`);
		if(this.#source) {
			debugAssets("[11ty/eleventy-fetch] Reading (side loaded) via %o", this.#source);
		} else {
			debugAssets("[11ty/eleventy-fetch] Reading (side loaded) %o", this.contentsPath);
		}

		this.#counts.read++;
		let data = fs.readFileSync(this.contentsPath, null);
		this.#contents = data;
		return data;
	}

	save() {
		if(this.#dryRun || !this.#savePending || this.#metadata && Object.keys(this.#metadata) === 0) {
			return;
		}

		this.ensureDir(); // doesn’t add to counts (yet?)

		// contents before metadata
		if(this.isSideLoaded()) {
			debugAssets("[11ty/eleventy-fetch] Writing %o (side loaded) from %o", this.contentsPath, this.#source);

			this.#counts.write++;

			// the contents must exist before the cache metadata are saved below
			fs.writeFileSync(this.contentsPath, contents);
			debug(`Writing ${this.contentsPath}`);
		}

		this.#counts.write++;
		debugAssets("[11ty/eleventy-fetch] Writing %o from %o", this.fsPath, this.#source);
		fs.writeFileSync(this.fsPath, JSON.stringify(Object.assign({}, this.#metadata, { data: this.#contents })), "utf8");
		debug(`Writing ${this.fsPath}`);
	}

	// for testing
	getFilePaths() {
		let paths = new Set();
		paths.add(this.fsPath);
		if(this.isSideLoaded()) {
			paths.add(this.contentsPath);
		}
		return Array.from(paths);
	}
}

module.exports = FileCache;
