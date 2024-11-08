const test = require("ava");
const fs = require("fs");
const Cache = require("../");
const RemoteAssetCache = require("../src/RemoteAssetCache");

test("Double Fetch", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-big.png";
	let ac1 = Cache(pngUrl);
	let ac2 = Cache(pngUrl);

	// Make sure we only fetch once!
	t.is(ac1, ac2);

	await ac1;
	await ac2;

	let forDestroyOnly = new RemoteAssetCache(pngUrl);
	// file is now accessible
	try {
		await forDestroyOnly.destroy();
	} catch (e) {}
});

test("Double Fetch (dry run)", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017-88.png";
	let ac1 = Cache(pngUrl, { dryRun: true });
	let ac2 = Cache(pngUrl, { dryRun: true });

	// Make sure we only fetch once!
	t.is(ac1, ac2);

	await ac1;
	await ac2;

	let forTestOnly = new RemoteAssetCache(pngUrl, ".cache", {
		dryRun: true,
	});
	// file is now accessible
	t.false(forTestOnly.hasCacheFiles());
});

test("Double Fetch async function (dry run)", async (t) => {
	let expected = { mockKey: "mockValue" };

	async function fetch() {
		return Promise.resolve(expected);
	};

let ac1 = Cache(fetch, {
	dryRun: true,
	formatUrlForDisplay() {
		return "fetch-1";
	},
});
let ac2 = Cache(fetch, {
	dryRun: true,
	formatUrlForDisplay() {
		return "fetch-2";
	},
});

	// Make sure we only fetch once!
	t.not(ac1, ac2);

	let result1 = await ac1;
	let result2 = await ac2;

	t.deepEqual(result1, result2);
	t.deepEqual(result1, expected);
	t.deepEqual(result2, expected);
});
