# eleventy-asset-cache Plugin

Cache remote assets, locally (automatically).

* Requires **Node 10+**

## Usage

### Cache a JSON file

```js
let url = "https://api.github.com/repos/11ty/eleventy";
let json = await CacheAsset(url, {
	duration: "1d",
	type: "json"
});
// Use imageBuffer as an input to the `sharp` plugin, for example
```

### Cache a remote image

This is what `eleventy-img` uses internally.

```js
const CacheAsset = require("@11ty/eleventy-cache-assets");
let url = "https://www.zachleat.com/img/avatar-2017-big.png";
let imageBuffer = await await CacheAsset(url, {
	duration: "1d",
	type: "buffer"
});
// Use imageBuffer as an input to the `sharp` plugin, for example
```

### Command line debug output

```js
DEBUG=EleventyCacheAssets* node your-node-script.js
DEBUG=EleventyCacheAssets* npx @11ty/eleventy
```

### Change Global Plugin Concurrency

```js
const CacheAsset = require("@11ty/eleventy-cache-assets");
CacheAsset.concurrency = 4; // default is 10
```


## Features

## Roadmap

* Use p-queue to manage concurrency instead of farming that upstream
* Offline mode that switches on automatically when no network connection is detected
* Add support for tiered asset requests, e.g. CSS requests background-images and web fonts, for example.

## Open Questions

* `flat-cache` save method seems to be synchronous, is there a better async one?
* Our cache stores raw buffers internally, which are pretty bloated compared to the original. Surely there is a more efficient way to do this. Maybe store the files in their original format.