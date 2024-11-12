const Sources = require("./Sources.js");
const AssetCache = require("./AssetCache.js");
// const debug = require("debug")("Eleventy:Fetch");

class RemoteAssetCache extends AssetCache {
	constructor(source, cacheDirectory, options = {}) {
		let requestId = RemoteAssetCache.getRequestId(source, options);
		super(requestId, cacheDirectory, options);

		this.source = source;
		this.options = options;
		this.displayUrl = RemoteAssetCache.convertUrlToString(source, options);
	}

	static getRequestId(source, options) {
		if (Sources.isValidComplexSource(source)) {
			return this.getCacheKey(source, options);
		}

		if (options.removeUrlQueryParams) {
			let cleaned = this.cleanUrl(source);
			return this.getCacheKey(cleaned, options);
		}

		return this.getCacheKey(source, options);
	}

	static getCacheKey(source, options) {
		let cacheKey = {
			source: AssetCache.getCacheKey(source, options),
		};

		if (options.fetchOptions) {
			if (options.fetchOptions.method && options.fetchOptions.method !== "GET") {
				cacheKey.method = options.fetchOptions.method;
			}
			if (options.fetchOptions.body) {
				cacheKey.body = options.fetchOptions.body;
			}
		}

		if(Object.keys(cacheKey).length > 1) {
			return JSON.stringify(cacheKey);
		}

		return cacheKey.source;
	}

	static cleanUrl(url) {
		if(!Sources.isFullUrl(url)) {
			return url;
		}

		let cleanUrl;
		if(typeof url === "string" || typeof url.toString === "function") {
			cleanUrl = new URL(url);
		} else if(url instanceof URL) {
			cleanUrl = url;
		} else {
			throw new Error("Invalid source for cleanUrl: " + url)
		}

		cleanUrl.search = new URLSearchParams([]);

		return cleanUrl.toString();
	}

	static convertUrlToString(source, options = {}) {
		// removes query params
		source = RemoteAssetCache.cleanUrl(source);

		let { formatUrlForDisplay } = options;
		if (formatUrlForDisplay && typeof formatUrlForDisplay === "function") {
			return "" + formatUrlForDisplay(source);
		}

		return "" + source;
	}

	async getResponseValue(response, type) {
		if (type === "json") {
			return response.json();
		} else if (type === "text") {
			return response.text();
		}
		return Buffer.from(await response.arrayBuffer());
	}

	async fetch(optionsOverride = {}) {
		let duration = optionsOverride.duration || this.options.duration;
		// Important: no disk writes when dryRun
		// As of Fetch v4, reads are now allowed!
		if (super.isCacheValid(duration)) {
			this.log(`Cache hit for ${this.displayUrl}`);
			return super.getCachedValue();
		}

		try {
			let isDryRun = optionsOverride.dryRun || this.options.dryRun;
			this.log(`${isDryRun ? "Fetching" : "Cache miss for"} ${this.displayUrl}`);

			let body;
			let type = optionsOverride.type || this.options.type;
			if (typeof this.source === "object" && typeof this.source.then === "function") {
				body = await this.source;
			} else if (typeof this.source === "function") {
				// sync or async function
				body = await this.source();
			} else {
				let fetchOptions = optionsOverride.fetchOptions || this.options.fetchOptions || {};
				if(!Sources.isFullUrl(this.source)) {
					throw Sources.getInvalidSourceError(this.source);
				}

				// v5: now using global (Node-native or otherwise) fetch instead of node-fetch
				let response = await fetch(this.source, fetchOptions);
				if (!response.ok) {
					throw new Error(
						`Bad response for ${this.displayUrl} (${response.status}): ${response.statusText}`,
						{ cause: response },
					);
				}

				body = await this.getResponseValue(response, type);
			}
			if (!isDryRun) {
				await super.save(body, type);
			}
			return body;
		} catch (e) {
			if (this.cachedObject) {
				this.log(`Error fetching ${this.displayUrl}. Message: ${e.message}`);
				this.log(`Failing gracefully with an expired cache entry.`);
				return super.getCachedValue();
			} else {
				return Promise.reject(e);
			}
		}
	}
}
module.exports = RemoteAssetCache;
