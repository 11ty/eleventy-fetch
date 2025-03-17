const fs = require("node:fs");
const path = require("node:path");

const DirectoryManager = require("./DirectoryManager.js");
const ExistsCache = require("./ExistsCache.js");

let existsCache = new ExistsCache();

class FileCache {
	#directoryManager;
	#data = {};
	#dryRun = false;
	#cacheDirectory = ".cache";
	#counts = {
		read: 0,
		write: 0,
	}

	constructor(cacheId, options = {}) {
		this.cacheId = cacheId;
		if(options.dir) {
			this.#cacheDirectory = options.dir;
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

	set(id, obj) {
		if(this.#data[id] !== obj) {
			this.#data[id] = obj;
			this.save();
		}
	}

	get fsPath() {
		return path.join(this.#cacheDirectory, this.cacheId);
	}

	get(id) {
		if(this.#data[id]) {
			return this.#data[id];
		}

		if(!existsCache.exists(this.fsPath)) {
			return;
		}

		this.#counts.read++;

		let data = fs.readFileSync(this.fsPath, "utf8");
		let json = JSON.parse(data);
		this.#data[id] = json;
		return json;
	}

	save() {
		this.ensureDir(); // doesn’t add to counts (yet?)

		this.#counts.write++;
		fs.writeFileSync(this.fsPath, JSON.stringify(this.#data), "utf8");
	}
}

module.exports = FileCache;
