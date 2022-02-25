const test = require("ava");
const path = require("path");
const fs = require("fs");
const shorthash = require("short-hash");
const { Util } = require("../");
const RemoteAssetCache = require("../src/RemoteAssetCache");

let fsp = fs.promises;

test("getDurationMs", t => {
	let cache = new RemoteAssetCache("lksdjflkjsdf");
	t.is(cache.getDurationMs("1s"), 1000);
	t.is(cache.getDurationMs("1m"), 60*1000);
	t.is(cache.getDurationMs("1h"), 60*60*1000);
	t.is(cache.getDurationMs("1d"), 24*60*60*1000);
	t.is(cache.getDurationMs("1w"), 7*24*60*60*1000);
	t.is(cache.getDurationMs("1y"), 365*24*60*60*1000);

	t.is(cache.getDurationMs("5s"), 5000);
	t.is(cache.getDurationMs("7m"), 60*7000);
	t.is(cache.getDurationMs("9h"), 60*60*9000);
	t.is(cache.getDurationMs("11d"), 24*60*60*11000);
	t.is(cache.getDurationMs("13w"), 7*24*60*60*13000);
	t.is(cache.getDurationMs("15y"), 365*24*60*60*15000);
});

test("Local hash file names", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	t.is((new RemoteAssetCache(pngUrl)).cachePath, path.resolve(".", `.cache/eleventy-fetch-${shorthash(pngUrl)}`));

	let fontUrl = "https://www.zachleat.com/font.woff";
	t.is((new RemoteAssetCache(fontUrl)).cachePath, path.resolve(".", `.cache/eleventy-fetch-${shorthash(fontUrl)}`));

	let fontUrl2 = "https://www.zachleat.com/font.woff2";
	t.is((new RemoteAssetCache(fontUrl2)).cachePath, path.resolve(".", `.cache/eleventy-fetch-${shorthash(fontUrl2)}`));
});

test("Clean url", async t => {
	let shortUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl = "https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is((new RemoteAssetCache(longUrl, ".cache", {
		removeUrlQueryParams: true,
	})).displayUrl, shortUrl);
});

test("Local hash without file extension in URL", async t => {
	let noExt = "https://twitter.com/zachleat/profile_image?size=bigger";
	t.is((new RemoteAssetCache(noExt)).cachePath, path.resolve(".", `.cache/eleventy-fetch-${shorthash(noExt)}`));
});

test("Fetching!", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	let ac = new RemoteAssetCache(pngUrl);
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);

	try {
		await ac.destroy()
	} catch(e) {}
});

test("Fetching (dry run)!", async t => {
	let svgUrl = "https://www.zachleat.com/img/avatar-2017-88.png";
	let ac = new RemoteAssetCache(svgUrl, ".cache", {
		dryRun: true
	});
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);
	t.false(ac.hasCacheFiles());
});

test("formatUrlForDisplay (manual query param removal)", async t => {
	let finalUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl = "https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is((new RemoteAssetCache(longUrl, ".cache", {
		removeUrlQueryParams: false,
		formatUrlForDisplay(url) {
			let [rest, queryParams] = url.split("?");
			return rest;
		}
	})).displayUrl, finalUrl);
});

test("formatUrlForDisplay (using removeUrlQueryParams)", async t => {
	let finalUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl = "https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is((new RemoteAssetCache(longUrl, ".cache", {
		removeUrlQueryParams: true,
		formatUrlForDisplay(url) {
			return url;
		}
	})).displayUrl, finalUrl);
});


test("Issue #6, URLs with HTTP Auth", async t => {
	let url = "https://${USERNAME}:${PASSWORD}@api.pinboard.in/v1/posts/all?format=json&tag=read";
	t.true(Util.isFullUrl(url));
});