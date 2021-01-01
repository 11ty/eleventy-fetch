const {default: PQueue} = require("p-queue");
const debug = require("debug")("EleventyCacheAssets");
const LRU = require("lru-cache");

const RemoteAssetCache = require("./src/RemoteAssetCache");
const AssetCache = require("./src/AssetCache");

const globalOptions = {
	type: "buffer",
	directory: ".cache",
	concurrency: 10,
	removeUrlQueryParams: false,
	fetchOptions: {},
	// see https://github.com/isaacs/node-lru-cache#options
	lruCacheOptions: {
		max: 10,
		length: function(item, key) {
			return 1;
		},
		dispose: function() {}
	}
};

function isFullUrl(url) {
	try {
		new URL(url);
		return true;
	} catch(e) {
		// invalid url OR already a local path
		return false;
	}
}

async function save(source, options) {
	if(!isFullUrl(source)) {
		return Promise.reject(new Error("Caching an already local asset is not yet supported."));
	}

	let asset = new RemoteAssetCache(source, options.directory, options);
	return asset.fetch(options);
}

/* Queue */
let queue = new PQueue({
	concurrency: globalOptions.concurrency
});

let memoryCache = new LRU(globalOptions.lruCacheOptions);

queue.on("active", () => {
	debug( `Concurrency: ${queue.concurrency}, Size: ${queue.size}, Pending: ${queue.pending}` );
});

function queueSave(source, opts) {
	let options = Object.assign({}, globalOptions, opts);
	
	let inMemoryResult = memoryCache.get(source);

	if(inMemoryResult) {
		return inMemoryResult;
	}

	let result = queue.add(() => save(source, options));

	memoryCache.set(source, result);

	return result;
}

module.exports = queueSave;

Object.defineProperty(module.exports, "concurrency", {
	get: function() {
		return queue.concurrency;
	},
	set: function(concurrency) {
		queue.concurrency = concurrency;
	},
});

Object.defineProperty(module.exports, "lruCacheOptions", {
	get: function() {
		return globalOptions.lruCacheOptions;
	},
	set: function(options) {
		// creates a new cache
		memoryCache = new LRU(options);
	},
});

// TODO make advanced manual things work with the queue too
module.exports.RemoteAssetCache = RemoteAssetCache;
module.exports.AssetCache = AssetCache;
