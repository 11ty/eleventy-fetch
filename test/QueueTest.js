const test = require("ava");
const Cache = require("../");
const queue = Cache.queue;
const RemoteAssetCache = require("../src/RemoteAssetCache");

test("Queue without options", async (t) => {
	let example = "https://example.com/";
	let req = await queue(example, () => {
		let asset = new RemoteAssetCache(example);
		return asset.fetch();
	});

	t.truthy(Buffer.isBuffer(req))

	try {
		await req.destroy();
	} catch (e) {}
});

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
		requestId: "fetch-1",
	});
	let ac2 = Cache(fetch, {
		dryRun: true,
		requestId: "fetch-2",
	});

	// two distinct fetches
	t.not(ac1, ac2);

	let result1 = await ac1;
	let result2 = await ac2;

	t.deepEqual(result1, result2);
	t.deepEqual(result1, expected);
	t.deepEqual(result2, expected);
});

test("Double Fetch 404 errors should only fetch once", async (t) => {
	let ac1 = Cache("https://httpstat.us/404", {
		dryRun: true,
	});
	let ac2 = Cache("https://httpstat.us/404", {
		dryRun: true,
	});

	// Make sure we only fetch once!
	t.is(ac1, ac2);

	await t.throwsAsync(async () => await ac1);
	await t.throwsAsync(async () => await ac2);
});

