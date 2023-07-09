const test = require("ava");
const path = require("path");
const fs = require("fs");
const AssetCache = require("../src/AssetCache");

function normalizePath(pathStr) {
  if(typeof pathStr !== "string") {
    return pathStr;
  }

  if(pathStr.match(/^[A-Z]\:/)) {
    pathStr = pathStr.substr(2);
  }
  return pathStr.split(path.sep).join("/");
}

test("Absolute path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", "/tmp/.cache");
  let cachePath = normalizePath(cache.cachePath);

  t.is(cachePath, "/tmp/.cache/eleventy-fetch-73015bafd152bccf9929e0f4dcbe36");
});

test("Relative path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", ".cache");
  let cachePath = normalizePath(cache.cachePath);

  t.not(cachePath, ".cache/eleventy-fetch-73015bafd152bccf9929e0f4dcbe36");
  t.true(cachePath.endsWith(".cache/eleventy-fetch-73015bafd152bccf9929e0f4dcbe36"));
});

test("AWS Lambda root directory resolves correctly", t => {
  let cwd = normalizePath(process.cwd());
  process.env.ELEVENTY_ROOT = cwd;
  process.env.LAMBDA_TASK_ROOT = "/var/task/z/";
	let cache = new AssetCache("lksdjflkjsdf", ".cache");
  let cachePath = normalizePath(cache.cachePath);

  t.is(cachePath, `${cwd}/.cache/eleventy-fetch-73015bafd152bccf9929e0f4dcbe36`);
  delete "ELEVENTY_ROOT" in process.env;
  delete "LAMBDA_TASK_ROOT" in process.env;
});

test("Test a save", async t => {
  let asset = new AssetCache("zachleat_twitter_followers", ".customcache");
  let cachePath = normalizePath(asset.cachePath);
  let jsonCachePath = normalizePath(asset.getCachedContentsPath("json"));

  await asset.save({followers: 10}, "json");

  t.truthy(fs.existsSync(jsonCachePath));

  fs.unlinkSync(cachePath);
  fs.unlinkSync(jsonCachePath);
});

test("Cache path should handle slashes without creating directories, issue #14", t => {
	let cache = new AssetCache("lksdjflk/jsdf", "/tmp/.cache");
  let cachePath = normalizePath(cache.cachePath);

  t.is(cachePath, "/tmp/.cache/eleventy-fetch-135797dbf5ab1187e5003c49162602");
});

test("Uses formatUrlForDisplay when caching a promise", async t => {
  let promise = Promise.resolve();
  let displayUrl = 'mock-display-url'
  let asset = new AssetCache(promise, ".customcache", { 
    formatUrlForDisplay() {
      return displayUrl;
    }
  });
  let cachePath = normalizePath(asset.cachePath);
  let jsonCachePath = normalizePath(asset.getCachedContentsPath("json"));

  await asset.save({name: "Sophia Smith" }, "json");

  t.truthy(fs.existsSync(jsonCachePath));

  fs.unlinkSync(cachePath);
  fs.unlinkSync(jsonCachePath);
});