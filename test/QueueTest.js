const test = require("ava");
const Cache = require("../eleventy-fetch.js");
const { queue, Fetch } = Cache;

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

	let forDestroyOnly = Fetch(pngUrl);
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

	let forTestOnly = Fetch(pngUrl, {
		cacheDirectory: ".cache",
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

test("Docs example https://www.11ty.dev/docs/plugins/fetch/#manually-store-your-own-data-in-the-cache", async (t) => {
	t.plan(2);

	async function fn() {
		t.true(true);
		return new Promise(resolve => {
			setTimeout(() => {
				resolve({ followerCount: 1000 })
			});
		});
	}

	let fakeFollowers = Cache(fn, {
		type: "json",
		dryRun: true,
		requestId: "zachleat_twitter_followers"
	});

	t.deepEqual(await fakeFollowers, {
		followerCount: 1000
	});
});

test("Raw Fetch using queue method", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017.png?q=1";
	let ac1 = Fetch(pngUrl);
	let ac2 = Fetch(pngUrl);

	// Destroy to clear any existing cache
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}

	// Make sure the instance is the same
	t.is(ac1, ac2);

	let result1 = await ac1.queue();
	t.false(ac1.wasLastFetchCacheHit())

	let result2 = await ac1.queue();
	// reuses the same fetch
	t.false(ac1.wasLastFetchCacheHit())

	t.is(result1, result2);

	// file is now accessible
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}
});


test("Raw Fetch using fetch method", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017.png?q=2";
	let ac1 = Fetch(pngUrl);
	let ac2 = Fetch(pngUrl);

	// Destroy to clear any existing cache
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}

	// Make sure the instance is the same
	t.is(ac1, ac2);

	let result1 = await ac1.fetch();
	t.false(ac1.wasLastFetchCacheHit())

	let result2 = await ac1.fetch();
	t.true(ac1.wasLastFetchCacheHit())

	t.is(result1, result2);

	// file is now accessible
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}
});

test("Raw Fetch using fetch method (check parallel fetch promise reuse)", async (t) => {
	let pngUrl = "https://www.zachleat.com/img/avatar-2017.png?q=3";
	let ac1 = Fetch(pngUrl);
	let ac2 = Fetch(pngUrl);

	// Destroy to clear any existing cache
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}

	// Make sure the instance is the same
	t.is(ac1, ac2);

	let fetch1 = ac1.fetch();
	let fetch2 = ac1.fetch();
	t.is(fetch1, fetch2);

	t.is(await fetch1, await fetch2);

	t.false(ac1.wasLastFetchCacheHit())

	// file is now accessible
	try {
		await ac1.destroy();
	} catch (e) {}
	try {
		await ac2.destroy();
	} catch (e) {}
});
