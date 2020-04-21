const AssetCache = require("./src/AssetCache");

const globalOptions = {
	type: "buffer",
	directory: ".cache"
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

module.exports = saveLocal;