const test = require("ava");
const fs = require("fs");
const shorthash = require("short-hash");
const AssetCache = require("../src/AssetCache");

let fsp = fs.promises;

test("Local hash file names", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	t.is((new AssetCache(pngUrl)).cachePath, `.cache/eleventy-cache-assets-${shorthash(pngUrl)}`);

	let fontUrl = "https://www.zachleat.com/font.woff";
	t.is((new AssetCache(fontUrl)).cachePath, `.cache/eleventy-cache-assets-${shorthash(fontUrl)}`);

	let fontUrl2 = "https://www.zachleat.com/font.woff2";
	t.is((new AssetCache(fontUrl2)).cachePath, `.cache/eleventy-cache-assets-${shorthash(fontUrl2)}`);
});

test("Local hash without file extension in URL", async t => {
	let noExt = "https://twitter.com/zachleat/profile_image?size=bigger";
	t.is((new AssetCache(noExt)).cachePath, `.cache/eleventy-cache-assets-${shorthash(noExt)}`);
});

test("Fetching!", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	let localUrl = `.cache/${shorthash(pngUrl)}`;

	let ac = new AssetCache(pngUrl);
	let buffer = await ac.fetch();
	t.is(Buffer.isBuffer(buffer), true);

	// file is now accessible
	await t.notThrowsAsync(fsp.access(ac.cachePath, fs.constants.R_OK));

	try {
		await fsp.unlink(ac.cachePath);
	} catch(e) {}
});