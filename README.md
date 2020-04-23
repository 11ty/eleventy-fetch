# eleventy-asset-cache Plugin

Don’t do a network request to your data source on every build! Do it once every hour! Save remote images locally!

* Requires **Node 10+**

* Fetch a remote URL and saves it to a local cache.
* Control concurrency so we don’t make too many network requests.
* If cache expires and the network connection fails, it will still use the cached request.

## Usage

### Cache a JSON file from an API

```js
let url = "https://api.github.com/repos/11ty/eleventy";
let json = await CacheAsset(url, {
	duration: "1d",
	type: "json"
});
// Use imageBuffer as an input to the `sharp` plugin, for example
```

### Cache a Remote Image

This is what [`eleventy-img`](https://github.com/11ty/eleventy-img/) uses internally.

```js
const CacheAsset = require("@11ty/eleventy-cache-assets");
let url = "https://www.zachleat.com/img/avatar-2017-big.png";
let imageBuffer = await CacheAsset(url, {
	duration: "1d",
	type: "buffer"
});
// Use imageBuffer as an input to the `sharp` plugin, for example
```

### Fetch Google Fonts CSS

Also a good example of using `fetchOptions` to pass in a custom user agent. Full option list is available on the [`node-fetch` documentation](https://www.npmjs.com/package/node-fetch#options).

```js
const CacheAsset = require("@11ty/eleventy-cache-assets");
let url = "https://fonts.googleapis.com/css?family=Roboto+Mono:400&display=swap";
let fontCss = imageBuffer = await CacheAsset(url, {
	duration: "1d",
	type: "text",
	fetchOptions: {
		headers: {
			// lol
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
		}
	}
});
```

### Change Global Plugin Concurrency

```js
const CacheAsset = require("@11ty/eleventy-cache-assets");
CacheAsset.concurrency = 4; // default is 10
```

### Command line debug output

```js
DEBUG=EleventyCacheAssets* node your-node-script.js
DEBUG=EleventyCacheAssets* npx @11ty/eleventy
```

<!--
## Roadmap

* Add support for tiered asset requests, e.g. CSS requests background-images and web fonts, for example.

## Open Questions

* `flat-cache` save method seems to be synchronous, is there a better async one?
* Our cache stores raw buffers internally, which are pretty bloated compared to the original. Surely there is a more efficient way to do this. Maybe store the files in their original format.
-->