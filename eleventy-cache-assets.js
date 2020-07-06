const {default: PQueue} = require("p-queue");
const debug = require("debug")("EleventyCacheAssets");

const RemoteAssetCache = require("./src/RemoteAssetCache");
const AssetCache = require("./src/AssetCache");

const globalOptions = {
	type: "buffer",
	directory: ".cache",
	concurrency: 10,
	removeUrlQueryParams: false,
	fetchOptions: {}
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

queue.on("active", () => {
	debug( `Concurrency: ${queue.concurrency}, Size: ${queue.size}, Pending: ${queue.pending}` );
});

function queueSave(source, opts) {
	let options = Object.assign({}, globalOptions, opts);
	return queue.add(() => save(source, options));
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

// TODO make advanced manual things work with the queue too
module.exports.RemoteAssetCache = RemoteAssetCache;
module.exports.AssetCache = AssetCache;
