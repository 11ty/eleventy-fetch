const test = require("ava");
const path = require("path");
const AssetCache = require("../src/AssetCache");

test("Absolute path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", "/tmp/.cache");

  t.is(cache.cachePath, "/tmp/.cache/eleventy-cache-assets-lksdjflkjsdf");
});

test("Relative path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", ".cache");

  t.not(cache.cachePath, ".cache/eleventy-cache-assets-lksdjflkjsdf");
  t.true(cache.cachePath.endsWith(".cache/eleventy-cache-assets-lksdjflkjsdf"));
});
