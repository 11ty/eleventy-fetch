const fs = require("fs");
const fsp = fs.promises; // Node 10+
const path = require("path");
const fetch = require("node-fetch");
const shorthash = require("short-hash");
const flatCache = require("flat-cache");
const AssetCache = require("./AssetCache");
const debug = require("debug")("EleventyCacheAssets");

class RemoteAssetCache extends AssetCache {
	constructor(url, cacheDirectory) {
		super(shorthash(url), cacheDirectory);
		this.url = url;
	}

	get url() {
		return this._url;
	}

	set url(url) {
		this._url = url;
	}

	async getValue(response, type) {
		if(type === "json") {
			return response.json();
		} else if(type === "text") {
			return response.text();
		}
		return response.buffer();
	}

	save(contents, type) {
		if(Buffer.isBuffer(contents)) {
			super.save(contents.toJSON(), type);
		} else {
			super.save(contents, type);
		}
	}

	async fetch(options = {}) {
		if( super.isCacheValid(options.duration) ) {
			return super.getCachedValue();
		}

		// make cacheDirectory if it does not exist.
		await fsp.mkdir(this.cacheDirectory, {
			recursive: true
		});

		try {
			let response = await fetch(this.url, options.fetchOptions || {});
			if(!response.ok) {
				throw new Error(`Bad response for ${this.url} (${res.status}): ${res.statusText}`)
			}

			let body = await this.getValue(response, options.type);
			console.log( `Caching: ${this.url}` ); // @11ty/eleventy-cache-assets
			this.save(body, options.type);
			return body;
		} catch(e) {
			if(this.cachedObject) {
				console.log( `Error fetching ${this.url}. Message: ${e.message}`);
				console.log( `Failing gracefully with an expired cache entry.` );
				return super.getCachedValue();
			} else {
				return Promise.reject(e);
			}
		}
	}
}
module.exports = RemoteAssetCache;