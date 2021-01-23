const test = require("ava");
const fs = require("fs");
const shorthash = require("short-hash");
const Cache = require("../");
const RemoteAssetCache = require("../src/RemoteAssetCache");

let fsp = fs.promises;

test("Double Fetch", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	let ac1 = Cache(pngUrl);
	let ac2 = Cache(pngUrl);

	// Make sure we only fetch once!
	t.is(ac1, ac2);

	await ac1;
	await ac2;

	let forDestroyOnly = new RemoteAssetCache(pngUrl);
	// file is now accessible
	await t.notThrowsAsync(forDestroyOnly.destroy());
});

test("Double Fetch (dry run)", async t => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-88.png";
	let ac1 = Cache(pngUrl, { dryRun: true });
	let ac2 = Cache(pngUrl, { dryRun: true });

	// Make sure we only fetch once!
	t.is(ac1, ac2);

	await ac1;
	await ac2;

	let forTestOnly = new RemoteAssetCache(pngUrl, ".cache", {
		dryRun: true
	});
	// file is now accessible
	t.false(forTestOnly.hasCacheFiles());
});