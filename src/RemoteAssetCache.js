const fs = require("fs");
const fsp = fs.promises; // Node 10+
const path = require("path");
const fetch = require("node-fetch");
const shorthash = require("short-hash");
const flatCache = require("flat-cache");
const AssetCache = require("./AssetCache");
const debug = require("debug")("EleventyCacheAssets");

class RemoteAssetCache extends AssetCache {
	constructor(url, cacheDirectory, options = {}) {
		let cleanUrl = url;
		if(options.removeUrlQueryParams) {
			cleanUrl = RemoteAssetCache.cleanUrl(url);
		}
		super(shorthash(cleanUrl), cacheDirectory);
		this.url = url;
		this.cleanUrl = cleanUrl;
	}

	static cleanUrl(url) {
		let cleanUrl = new URL(url);
		cleanUrl.search = new URLSearchParams([]);
		return cleanUrl.toString();
	}

	get url() {
		return this._url;
	}

	set url(url) {
		this._url = url;
	}

	async getResponseValue(response, type) {
		if(type === "json") {
			return response.json();
		} else if(type === "text") {
			return response.text();
		}
		return response.buffer();
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
				throw new Error(`Bad response for ${this.cleanUrl} (${response.status}): ${response.statusText}`)
			}

			let body = await this.getResponseValue(response, options.type);
			console.log( `Caching: ${this.cleanUrl}` ); // @11ty/eleventy-cache-assets
			await super.save(body, options.type);
			return body;
		} catch(e) {
			if(this.cachedObject) {
				console.log( `Error fetching ${this.cleanUrl}. Message: ${e.message}`);
				console.log( `Failing gracefully with an expired cache entry.` );
				return super.getCachedValue();
			} else {
				return Promise.reject(e);
			}
		}
	}
}
module.exports = RemoteAssetCache;