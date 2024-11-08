const AssetCache = require("./AssetCache");
// const debug = require("debug")("Eleventy:Fetch");

class RemoteAssetCache extends AssetCache {
	constructor(url, cacheDirectory, options = {}) {
		let cleanUrl = url;
		if (options.removeUrlQueryParams) {
			cleanUrl = RemoteAssetCache.cleanUrl(cleanUrl);
		}

		// Must run after removeUrlQueryParams
		let displayUrl = RemoteAssetCache.convertUrlToString(cleanUrl, options);
		let cacheKeyArray = RemoteAssetCache.getCacheKey(displayUrl, options);

		super(cacheKeyArray, cacheDirectory, options);

		this.url = url;
		this.options = options;

		this.displayUrl = displayUrl;
	}

	static getUid(source, options) {
		let displayUrl = RemoteAssetCache.convertUrlToString(source, options);
		let cacheKeyArray = RemoteAssetCache.getCacheKey(displayUrl, options);
		return cacheKeyArray.join(",");
	}

	static getCacheKey(source, options) {
		// Promise sources are handled upstream
		let cacheKey = [source];

		if (options.fetchOptions) {
			if (options.fetchOptions.method && options.fetchOptions.method !== "GET") {
				cacheKey.push(options.fetchOptions.method);
			}
			if (options.fetchOptions.body) {
				cacheKey.push(options.fetchOptions.body);
			}
		}

		return cacheKey;
	}

	static cleanUrl(url) {
		if(typeof url !== "string" && !(url instanceof URL)) {
			return url;
		}

		let cleanUrl;
		if(typeof url === "string") {
			cleanUrl = new URL(url);
		} else if(url instanceof URL) {
			cleanUrl = url;
		}

		cleanUrl.search = new URLSearchParams([]);

		return cleanUrl.toString();
	}

	static convertUrlToString(source, options = {}) {
		let { formatUrlForDisplay } = options;
		if (formatUrlForDisplay && typeof formatUrlForDisplay === "function") {
			return formatUrlForDisplay(source);
		}

		return source;
	}

	get url() {
		return this._url;
	}

	set url(url) {
		this._url = url;
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
			if (typeof this.url === "object" && typeof this.url.then === "function") {
				body = await this.url;
			} else if (typeof this.url === "function" && this.url.constructor.name === "AsyncFunction") {
				body = await this.url();
			} else {
				let fetchOptions = optionsOverride.fetchOptions || this.options.fetchOptions || {};

				// v5: now using global (Node-native or otherwise) fetch instead of node-fetch
				let response = await fetch(this.url, fetchOptions);
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
