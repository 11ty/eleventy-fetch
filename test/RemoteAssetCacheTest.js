const test = require("ava");
const path = require("path");
const { Util } = require("../");
const AssetCache = require("../src/AssetCache");
const RemoteAssetCache = require("../src/RemoteAssetCache");

test("getDurationMs", (t) => {
	let cache = new RemoteAssetCache("lksdjflkjsdf");
	t.is(cache.getDurationMs("1s"), 1000);
	t.is(cache.getDurationMs("1m"), 60 * 1000);
	t.is(cache.getDurationMs("1h"), 60 * 60 * 1000);
	t.is(cache.getDurationMs("1d"), 24 * 60 * 60 * 1000);
	t.is(cache.getDurationMs("1w"), 7 * 24 * 60 * 60 * 1000);
	t.is(cache.getDurationMs("1y"), 365 * 24 * 60 * 60 * 1000);

	t.is(cache.getDurationMs("5s"), 5000);
	t.is(cache.getDurationMs("7m"), 60 * 7000);
	t.is(cache.getDurationMs("9h"), 60 * 60 * 9000);
	t.is(cache.getDurationMs("11d"), 24 * 60 * 60 * 11000);
	t.is(cache.getDurationMs("13w"), 7 * 24 * 60 * 60 * 13000);
	t.is(cache.getDurationMs("15y"), 365 * 24 * 60 * 60 * 15000);
});

test("Local hash file names", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	t.is(
		new RemoteAssetCache(pngUrl).cachePath,
		path.resolve(".", `.cache/eleventy-fetch-${AssetCache.getHash(pngUrl)}`),
	);

	let fontUrl = "https://www.zachleat.com/font.woff";
	t.is(
		new RemoteAssetCache(fontUrl).cachePath,
		path.resolve(".", `.cache/eleventy-fetch-${AssetCache.getHash(fontUrl)}`),
	);

	let fontUrl2 = "https://www.zachleat.com/font.woff2";
	t.is(
		new RemoteAssetCache(fontUrl2).cachePath,
		path.resolve(".", `.cache/eleventy-fetch-${AssetCache.getHash(fontUrl2)}`),
	);
});

test("Clean url", async (t) => {
	let shortUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl =
		"https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is(
		new RemoteAssetCache(longUrl, ".cache", {
			removeUrlQueryParams: true,
		}).displayUrl,
		shortUrl,
	);
});

test("Local hash without file extension in URL", async (t) => {
	let noExt = "https://twitter.com/zachleat/profile_image?size=bigger";
	t.is(
		new RemoteAssetCache(noExt).cachePath,
		path.resolve(".", `.cache/eleventy-fetch-${AssetCache.getHash(noExt)}`),
	);
});

test("Unique hashes for URLs", async (t) => {
	let apiURL1 = "https://api.zooniverse.org/projects/illustratedlife/talk/subjects/ASC0000qu3";
	let apiURL2 = "https://api.zooniverse.org/projects/illustratedlife/talk/subjects/ASC0000q71";
	let cachePath1 = new RemoteAssetCache(apiURL1).cachePath;
	let cachePath2 = new RemoteAssetCache(apiURL2).cachePath;
	t.not(cachePath1, cachePath2);
});

test("Same hashes for implicit and explicit HTTP GET", async (t) => {
	let sameURL = "https://example.com/";
	let cachePath1 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: { method: "GET" },
	}).cachePath;
	let cachePath2 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: {},
	}).cachePath;
	t.is(cachePath1, cachePath2);
});

test("Unique hashes for different HTTP methods", async (t) => {
	let sameURL = "https://example.com/";
	let cachePath1 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: { method: "POST" },
	}).cachePath;
	let cachePath2 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: { method: "DELETE" },
	}).cachePath;
	t.not(cachePath1, cachePath2);
});

test("Unique hashes for different HTTP bodies", async (t) => {
	let sameURL = "https://example.com/";
	let cachePath1 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: { body: "123" },
	}).cachePath;
	let cachePath2 = new RemoteAssetCache(sameURL, ".cache", {
		fetchOptions: { body: "456" },
	}).cachePath;
	t.not(cachePath1, cachePath2);
});

test("Fetching!", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	let ac = new RemoteAssetCache(pngUrl);
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);

	try {
		await ac.destroy();
	} catch (e) {}
});

test("Fetching (dry run)!", async (t) => {
	let svgUrl = "https://www.zachleat.com/img/avatar-2017-88.png";
	let ac = new RemoteAssetCache(svgUrl, ".cache", {
		dryRun: true,
	});
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);
	t.false(ac.hasCacheFiles());
});

test("Fetching pass in URL", async (t) => {
	let pngUrl = new URL("https://www.zachleat.com/img/avatar-2017-big.png");
	let ac = new RemoteAssetCache(pngUrl);
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);

	try {
		await ac.destroy();
	} catch (e) {}
});

test("Fetching pass non-stringable", async (t) => {
	class B {}

	let ac = new RemoteAssetCache(new B(), undefined, {
		dryRun: true,
	});

	try {
		await ac.fetch();
	} catch (e) {
		t.is(e.message, "Failed to parse URL from [object Object]");
		t.truthy(e.cause);
	}
});

test("Fetching pass class with toString()", async (t) => {
	class B {
		toString() {
			return "https://www.zachleat.com/img/avatar-2017-big.png";
		}
	}

	let ac = new RemoteAssetCache(new B());
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);

	try {
		await ac.destroy();
	} catch (e) {}
});

test("formatUrlForDisplay (manual query param removal)", async (t) => {
	let finalUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl =
		"https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is(
		new RemoteAssetCache(longUrl, ".cache", {
			removeUrlQueryParams: false,
			formatUrlForDisplay(url) {
				let [rest, queryParams] = url.split("?");
				return rest;
			},
		}).displayUrl,
		finalUrl,
	);
});

test("formatUrlForDisplay (using removeUrlQueryParams)", async (t) => {
	let finalUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let longUrl =
		"https://example.com/207115/photos/243-0-1.jpg?Policy=FAKE_THING~2123ksjhd&Signature=FAKE_THING~2123ksjhd&Key-Pair-Id=FAKE_THING~2123ksjhd";
	t.is(
		new RemoteAssetCache(longUrl, ".cache", {
			removeUrlQueryParams: true,
			formatUrlForDisplay(url) {
				return url;
			},
		}).displayUrl,
		finalUrl,
	);
});

test("Issue #6, URLs with HTTP Auth", async (t) => {
	let url = "https://${USERNAME}:${PASSWORD}@api.pinboard.in/v1/posts/all?format=json&tag=read";
	t.true(Util.isFullUrl(url));
});

test("Error with `cause`", async (t) => {
	let finalUrl = "https://example.com/207115/photos/243-0-1.jpg";
	let asset = new RemoteAssetCache(finalUrl);

	try {
		await asset.fetch();
	} catch (e) {
		t.is(
			e.message,
			`Bad response for https://example.com/207115/photos/243-0-1.jpg (404): Not Found`,
		);
		t.truthy(e.cause);
	}

	try {
		await asset.destroy();
	} catch (e) {}
});

test("supports promises that resolve", async (t) => {
	let expected = { mockKey: "mockValue" };
	let promise = Promise.resolve(expected);
	let asset = new RemoteAssetCache(promise, undefined, {
		type: "json",
		formatUrlForDisplay() {
			return "resolve-promise";
		},
	});

	let actual = await asset.fetch();

	t.deepEqual(actual, expected);

	try {
		await asset.destroy();
	} catch (e) {}
});

test("supports promises that reject", async (t) => {
	let expected = "mock error message";
	let cause = new Error("mock cause");
	let promise = Promise.reject(new Error(expected, { cause }));

	let asset = new RemoteAssetCache(promise, undefined, {
		formatUrlForDisplay() {
			return "reject-promise";
		},
	});

	try {
		await asset.fetch();
	} catch (e) {
		t.is(e.message, expected);
		t.is(e.cause, cause);
	}

	try {
		await asset.destroy();
	} catch (e) {}
});

test("supports async functions that return data", async (t) => {
	let expected = { mockKey: "mockValue" };
	let asyncFunction = async () => {
		return Promise.resolve(expected);
	};
	let asset = new RemoteAssetCache(asyncFunction, undefined, {
		type: "json",
		formatUrlForDisplay() {
			return "async-return";
		},
	});

	let actual = await asset.fetch();

	t.deepEqual(actual, expected);

	try {
		await asset.destroy();
	} catch (e) {}
});

test("supports async functions that throw", async (t) => {
	let expected = "mock error message";
	let cause = new Error("mock cause");
	let asyncFunction = async () => {
		throw new Error(expected, { cause });
	};

	let asset = new RemoteAssetCache(asyncFunction, undefined, {
		formatUrlForDisplay() {
			return "async-throws";
		},
	});

	try {
		await asset.fetch();
	} catch (e) {
		t.is(e.message, expected);
		t.is(e.cause, cause);
	}

	try {
		await asset.destroy();
	} catch (e) {}
});
