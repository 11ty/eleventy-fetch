const test = require("ava");
const path = require("path");
const AssetCache = require("../src/AssetCache");

function normalizePath(pathStr) {
  if(pathStr.match(/^[A-Z]\:/)) {
    pathStr = pathStr.substr(2);
  }
  return pathStr.split(path.sep).join("/");
}

test("Absolute path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", "/tmp/.cache");

  t.is(normalizePath(cache.cachePath), "/tmp/.cache/eleventy-cache-assets-lksdjflkjsdf");
});

test("Relative path cache directory", t => {
	let cache = new AssetCache("lksdjflkjsdf", ".cache");

  t.not(cache.cachePath, ".cache/eleventy-cache-assets-lksdjflkjsdf");
  t.true(cache.cachePath.endsWith(".cache/eleventy-cache-assets-lksdjflkjsdf"));
});

test("AWS Lambda root directory resolves correctly", t => {
  let cwd = process.cwd();
  process.env.ELEVENTY_ROOT = cwd;
  process.env.LAMBDA_TASK_ROOT = "/var/task/z/";
	let cache = new AssetCache("lksdjflkjsdf", ".cache");
  
  t.is(cache.cachePath, `${cwd}/.cache/eleventy-cache-assets-lksdjflkjsdf`);
  delete "ELEVENTY_ROOT" in process.env;
  delete "LAMBDA_TASK_ROOT" in process.env;
});