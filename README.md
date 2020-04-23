# eleventy-cache-assets

Don’t do a network request to your data source on every build! Do it once every minute, or every hour, or every day!

This can save any kind of asset—JSON, HTML, images, videos, etc.

* Requires **Node 10+**

* Fetch a remote URL and saves it to a local cache.
* Control concurrency so we don’t make too many network requests at the same time.
* If cache expires and the network connection fails, it will still use the cached request.

## Installation

```
npm install @11ty/eleventy-cache-assets
```

## Usage

### Cache a JSON file from an API

```js
let url = "https://api.github.com/repos/11ty/eleventy";
let json = await CacheAsset(url, {
	duration: "1d",
	type: "json"
});
```

### Options

#### Change the Cache Duration

The `duration` option currently supports values with the following shorthand values:

* `s` is seconds (e.g. `duration: "43s"`)
* `m` is minutes (e.g. `duration: "2m"`)
* `h` is hours (e.g. `duration: "99h"`)
* `d` is days
* `w` is weeks (7 days)
* `y` is 365 days (about 1 year)

#### Type

* `type: "json"`
* `type: "text"`
* `type: "buffer"` (default: use this for non-text things)

### Handle failure gracefully

Note that this will only apply if the first request fails (and no cache exists). If a failure happens and a cached entry already exists (even if it’s expired), it will use the cached entry.

```js
async function fetchData() {
	try {
		let url = "https://api.github.com/repos/11ty/eleventy";
		/* promise */
		return CacheAsset(url, {
			duration: "1d",
			type: "json"
		});
	} catch(e) {
		return {
			// my failure fallback data
		}
	}
}
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