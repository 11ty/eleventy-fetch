const {default: PQueue} = require("p-queue");
const debug = require("debug")("EleventyCacheAssets");

const AssetCache = require("./src/AssetCache");

const globalOptions = {
	type: "buffer",
	directory: ".cache",
	concurrency: 10,
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


async function saveLocal(url, options) {
	if(!isFullUrl(url)) {
		throw new Error("Caching an already local asset is not yet supported.")
	}

	let asset = new AssetCache(url, options.directory);
	return asset.fetch(options);
}

/* Queue */
let queue = new PQueue({
	concurrency: globalOptions.concurrency
});

queue.on("active", () => {
	debug( `Concurrency: ${queue.concurrency}, Size: ${queue.size}, Pending: ${queue.pending}` );
});


function queueSaveLocal(url, opts) {
	let options = Object.assign({}, globalOptions, opts);
	return queue.add(() => saveLocal(url, options));
}

module.exports = queueSaveLocal;

Object.defineProperty(module.exports, "concurrency", {
	get: function() {
		return queue.concurrency;
	},
	set: function(concurrency) {
		queue.concurrency = concurrency;
	},
});