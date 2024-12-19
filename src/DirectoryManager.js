const fs = require("node:fs");
const path = require("node:path");
const debugUtil = require("debug");
const debugAssets = debugUtil("Eleventy:Assets");

class DirectoryManager {
  #dirs = new Set();

  isCreated(dir) {
    return this.#dirs.has(dir);
  }

  create(dir) {
    if(this.isCreated(dir)) {
      return;
    }

    this.#dirs.add(dir);
    debugAssets("[11ty/eleventy-fetch] Creating directory %o", dir);
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = DirectoryManager;