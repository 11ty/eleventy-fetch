const { default: PQueue } = require("p-queue");
const debug = require("debug")("Eleventy:Fetch");

const Sources = require("./src/Sources.js");
const RemoteAssetCache = require("./src/RemoteAssetCache.js");
const AssetCache = require("./src/AssetCache.js");

const globalOptions = {
	type: "buffer",
	directory: ".cache",
	concurrency: 10,
	fetchOptions: {},
	dryRun: false, // don’t write anything to the file system

	// *does* affect cache key hash
	removeUrlQueryParams: false,

	// runs after removeUrlQueryParams, does not affect cache key hash
	// formatUrlForDisplay: function(url) {
	// 	return url;
	// },

	verbose: false, // Changed in 3.0+

	hashLength: 30,
};

/* Queue */
let queue = new PQueue({
	concurrency: globalOptions.concurrency,
});

queue.on("active", () => {
	debug(`Concurrency: ${queue.concurrency}, Size: ${queue.size}, Pending: ${queue.pending}`);
});

let inProgress = {};

function queueSave(source, queueCallback, options) {
	let sourceKey = RemoteAssetCache.getRequestId(source, options);
	if(!sourceKey) {
		return Promise.reject(Sources.getInvalidSourceError(source));
	}

	if (!inProgress[sourceKey]) {
		inProgress[sourceKey] = queue.add(queueCallback).finally(() => {
			delete inProgress[sourceKey];
		});
	}

	return inProgress[sourceKey];
}

module.exports = function (source, options) {
	if (!Sources.isFullUrl(source) && !Sources.isValidSource(source)) {
		throw new Error("Caching an already local asset is not yet supported.");
	}

	let mergedOptions = Object.assign({}, globalOptions, options);
	return queueSave(source, () => {
		let asset = new RemoteAssetCache(source, mergedOptions.directory, mergedOptions);
		return asset.fetch(mergedOptions);
	}, mergedOptions);
};

Object.defineProperty(module.exports, "concurrency", {
	get: function () {
		return queue.concurrency;
	},
	set: function (concurrency) {
		queue.concurrency = concurrency;
	},
});

module.exports.queue = queueSave;
module.exports.Util = {
	isFullUrl: Sources.isFullUrl,
};
module.exports.RemoteAssetCache = RemoteAssetCache;
module.exports.AssetCache = AssetCache;
module.exports.Sources = Sources;
