<p align="center"><img src="https://www.11ty.dev/img/logo-github.png" alt="eleventy Logo"></p>

# eleventy-cache-assets

_This is a plugin for the [Eleventy static site generator](https://www.11ty.dev/). ℹ️ Please go to the [full eleventy-cache-assets documentation on 11ty.dev](/docs/plugins/cache/)._

Fetch network resources and cache them so you don’t bombard your API (or other resources). Do this at configurable intervals—not with every build! Once per minute, or once per hour, once per day, or however often you like!

With the added benefit that if one successful request completes, you can now work offline!

This plugin can save any kind of asset—JSON, HTML, images, videos, etc.

* ℹ️ Please go to the [full eleventy-cache-assets documentation on 11ty.dev](/docs/plugins/cache/)
* Find more [Eleventy plugins](https://www.11ty.dev/docs/plugins/).

## ➡ [Eleventy Documentation](https://www.11ty.dev/docs/)

- Please star [this repo](https://github.com/11ty/eleventy-cache-assets/) and [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-cache-assets.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-cache-assets) [![GitHub issues](https://img.shields.io/github/issues/11ty/eleventy-cache-assets.svg?style=for-the-badge)](https://github.com/11ty/eleventy/issues)

## Installation

```
npm install @11ty/eleventy-cache-assets
```

_ℹ️ Please go to the [full eleventy-cache-assets documentation on 11ty.dev](/docs/plugins/cache/)._

## Tests

```
npm run test
```

- We use the [ava JavaScript test runner](https://github.com/avajs/ava) ([Assertions documentation](https://github.com/avajs/ava/blob/master/docs/03-assertions.md))
- ℹ️ To keep tests fast, thou shalt try to avoid writing files in tests.


<!--
## Roadmap

* Add support for tiered asset requests, e.g. CSS requests background-images and web fonts, for example.

## Open Questions

* `flat-cache` save method seems to be synchronous, is there a better async one?
* Our cache stores raw buffers internally, which are pretty bloated compared to the original. Surely there is a more efficient way to do this. Maybe store the files in their original format.
-->
