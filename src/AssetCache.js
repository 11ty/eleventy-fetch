const fs = require("fs");
const fsp = fs.promises; // Node 10+
const path = require("path");
const fetch = require("node-fetch");
const flatCache = require("flat-cache");
const debug = require("debug")("EleventyCacheAssets");

class AssetCache {
	constructor(uniqueKey, cacheDirectory) {
		this.hash = uniqueKey;
		this.cacheDirectory = cacheDirectory || ".cache";
		this.defaultDuration = "1d";
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
		if(value !== this._hash) {
			this._cacheLocationDirty = true;
		}

		this._hash = value;
	}

	get cacheDirectory() {
		return this._cacheDirectory;
	}

	set cacheDirectory(dir) {
		if(dir !== this._cacheDirectory) {
			this._cacheLocationDirty = true;
		}

		this._cacheDirectory = dir;
	}

	get cacheFilename() {
		return `eleventy-cache-assets-${this.hash}`;
	}

	get cachePath() {
		return path.join(this.cacheDirectory, this.cacheFilename);
	}

	get cache() {
		if(!this._cache || this._cacheLocationDirty) {
			this._cache = flatCache.load(this.cacheFilename, path.resolve(this.cacheDirectory));
		}
		return this._cache;
	}

	getDurationMs(duration = "0s") {
		let durationUnits = duration.substr(-1);
		let durationMultiplier;
		if(durationUnits === "s") {
			durationMultiplier = 1;
		} else if(durationUnits === "m") {
			durationMultiplier = 60;
		} else if(durationUnits === "h") {
			durationMultiplier = 60 * 60;
		} else if(durationUnits === "d") {
			durationMultiplier = 60 * 60 * 24;
		} else if(durationUnits === "w") {
			durationMultiplier = 60 * 60 * 24 * 7;
		} else if(durationUnits === "y") {
			durationMultiplier = 60 * 60 * 24 * 365;
		}

		let durationValue = parseInt(duration.substr(0, duration.length - 1), 10);
		return durationValue * durationMultiplier * 1000;
	}

	save(contents, type) {
		let cache = this.cache;
		cache.setKey(this.hash, {
			cachedAt: Date.now(),
			type: type,
			contents: contents
		});
		cache.save();
	}

	getCachedValue() {
		let type = this.cachedObject.type;
		if(type === "json") {
			return this.cachedObject.contents;
		} else if(type === "text") {
			return this.cachedObject.contents.toString();
		}

		// buffer
		return Buffer.from(this.cachedObject.contents);
	}

	isCacheValid(duration) {
		return this.needsToFetch(duration || this.defaultDuration) === false;
	}

	get cachedObject() {
		return this.cache.getKey(this.hash);
	}

	needsToFetch(duration) {
		if(!this.cachedObject) { // not cached
			return true;
		} else if(!duration || duration === "*") {
			// no duration specified (plugin default is 1d, but if this is falsy assume infinite)
			// "*" is infinite duration
			return false;
		}

		debug("Cache check for: %o (duration: %o)", this.source, duration);

		let compareDuration = this.getDurationMs(duration);
		let expiration = this.cachedObject.cachedAt + compareDuration;
		let expirationRelative = Math.abs(Date.now() - expiration);

		if(expiration > Date.now()) {
			debug("Cache okay, expires in %o s (%o)", expirationRelative/1000, new Date(expiration));
			return false;
		}

		debug("Cache expired %o s ago (%o)", expirationRelative/1000, new Date(expiration));
		return true;
	}

	async fetch(options) {
		if( this.isCacheValid(options.duration) ) {
			return this.getCachedValue();
		}

		this.save(this.source, options.type);

		return asset;

	}
}
module.exports = AssetCache;