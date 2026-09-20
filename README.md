<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="eleventy Logo"></p>

# eleventy-fetch

_Requires Node 18+_

Formerly known as [`@11ty/eleventy-cache-assets`](https://www.npmjs.com/package/@11ty/eleventy-cache-assets).

Fetch network resources and cache them so you don’t bombard your API (or other resources). Do this at configurable intervals—not with every build! Once per minute, or once per hour, once per day, or however often you like!

With the added benefit that if one successful request completes, you can now work offline!

This plugin can save any kind of asset—JSON, HTML, images, videos, etc.

## [The full `eleventy-fetch` documentation is on 11ty.dev](https://www.11ty.dev/docs/plugins/cache/).

- _This is a plugin for the [Eleventy static site generator](https://www.11ty.dev/)._
- Find more [Eleventy plugins](https://www.11ty.dev/docs/plugins/).
- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/), follow [@eleven_ty](https://twitter.com/eleven_ty) on Twitter, and support [11ty on Open Collective](https://opencollective.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-fetch.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-fetch) [![GitHub issues](https://img.shields.io/github/issues/11ty/eleventy-fetch.svg?style=for-the-badge)](https://github.com/11ty/eleventy/issues)

## Installation

```
npm install @11ty/eleventy-fetch
```

_[The full `eleventy-fetch` documentation is on 11ty.dev](https://www.11ty.dev/docs/plugins/cache/)._

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

## Community Roadmap

- [Top Feature Requests](https://github.com/11ty/fetch/issues?q=label%3Aneeds-votes+sort%3Areactions-%2B1-desc+label%3Aenhancement) (Add your own votes using the 👍 reaction)
- [Top Bugs 😱](https://github.com/11ty/fetch/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc) (Add your own votes using the 👍 reaction)
- [Newest Bugs 🙀](https://github.com/11ty/fetch/issues?q=is%3Aopen+is%3Aissue+label%3Abug)


## 🌐 Web Resources & Aesthetic Symbols Index
- [SYM 1F627](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-1f627/)
- [SYM 1D453](https://anime-sparkle-text-45.pages.dev/symbol/sym-1d453/)
- [KHANDA EMBLEM](https://kawaii-kaomoji-hub-45.pages.dev/symbol/khanda-emblem/)
- [SYM 26B9](https://moe-star-kaomoji-60.pages.dev/symbol/sym-26b9/)
- [SYM 1F618](https://dollcore-bio-symbols-12.pages.dev/symbol/sym-1f618/)
- [STARS](https://minimal-star-symbols-89.pages.dev/es/stars/)
- [SYM 2688](https://moe-soft-emoticons-41.pages.dev/symbol/sym-2688/)
- [FLOWER GIRL SMILE KAOMOJI](https://sanrio-soft-kaomoji-71.pages.dev/symbol/flower-girl-smile-kaomoji/)
- [TENDER GENTLE TEAR KAOMOJI](https://occult-runic-fonts-23.pages.dev/symbol/tender-gentle-tear-kaomoji/)
- [MUSIC WEATHER](https://vintage-bow-text-15.pages.dev/es/music-weather/)
- [SYM 1F928](https://glitch-font-studio-46.pages.dev/symbol/sym-1f928/)
- [VI](https://coquette-aesthetic-symbols-71.pages.dev/vi/)
- [SYM 1D45C](https://anime-sparkle-text-91.pages.dev/symbol/sym-1d45c/)
- [SYM 1F61B](https://glitch-text-generator-65.pages.dev/symbol/sym-1f61b/)
- [SYM 1F92E](https://coquette-aesthetic-symbols-35.pages.dev/symbol/sym-1f92e/)
- [GEORGIAN LOVE HEART](https://ribbon-bow-text-90.pages.dev/symbol/georgian-love-heart/)
- [SYM 2630](https://noir-poet-unicode-63.pages.dev/symbol/sym-2630/)
- [SYM 1D456](https://pastel-kaomoji-vault-54.pages.dev/symbol/sym-1d456/)
- [SYM 1D471](https://mecha-crosshair-symbols-40.pages.dev/symbol/sym-1d471/)
- [SYM 2673](https://zen-arrow-symbols-99.pages.dev/symbol/sym-2673/)
- [SYM 26AF](https://glitch-bio-generator-83.pages.dev/symbol/sym-26af/)
- [SYM 2728](https://neon-glitch-fonts-26.pages.dev/symbol/sym-2728/)
- [HEARTS](https://clean-unicode-borders-23.pages.dev/hearts/)
- [AESTHETIC MINIMAL CLOUD](https://baroque-curse-text-56.pages.dev/symbol/aesthetic-minimal-cloud/)
- [SYM 1D426](https://soft-pink-fonts-41.pages.dev/symbol/sym-1d426/)
- [SYM 2631](https://ribbon-bow-text-90.pages.dev/symbol/sym-2631/)
- [GAMING WEAPONS](https://neon-glitch-fonts-26.pages.dev/pt/gaming-weapons/)
- [SYM 2632](https://vintage-angel-text-38.pages.dev/symbol/sym-2632/)
- [LEFT WING CLAN FLARE](https://vintage-scholarly-text-77.pages.dev/symbol/left-wing-clan-flare/)
- [TABLE FLIP RAGE KAOMOJI](https://mecha-gamer-fonts-53.pages.dev/symbol/table-flip-rage-kaomoji/)
- [FREEFIRE NAMES](https://vintage-lace-symbols-65.pages.dev/ru/freefire-names/)
- [SYM 1D483](https://pastel-moe-emoticons-55.pages.dev/symbol/sym-1d483/)
- [SYM 1D46C](https://clean-spacing-fonts-98.pages.dev/symbol/sym-1d46c/)
- [SYM 267C](https://vintage-library-symbols-25.pages.dev/symbol/sym-267c/)
- [LATIN CROSS FAITH](https://zen-unicode-hub-94.pages.dev/symbol/latin-cross-faith/)
- [SYM 2722](https://dark-poetry-symbols-18.pages.dev/symbol/sym-2722/)
- [SYM 1F62E 200D 1F4A8](https://synthwave-text-vault-95.pages.dev/symbol/sym-1f62e-200d-1f4a8/)
- [SYM 1D484](https://glitch-matrix-symbols-22.pages.dev/symbol/sym-1d484/)
- [SYM 2615](https://zen-unicode-symbols-89.pages.dev/symbol/sym-2615/)
- [SYM 1F61C](https://coquette-aesthetic-symbols-31.pages.dev/symbol/sym-1f61c/)
- [LEFT HEAVY BRACKET BOX](https://minimal-star-symbols-14.pages.dev/symbol/left-heavy-bracket-box/)
- [SYM 1D48A](https://angelic-heart-symbols-57.pages.dev/symbol/sym-1d48a/)
- [SYM 1D400](https://neon-matrix-symbols-87.pages.dev/symbol/sym-1d400/)
- [SYM 267F](https://moe-star-kaomoji-58.pages.dev/symbol/sym-267f/)
- [SYM 1F911](https://ribbon-bow-text-90.pages.dev/symbol/sym-1f911/)
- [SKULL AND CROSSBONES](https://baroque-curse-text-56.pages.dev/symbol/skull-and-crossbones/)
- [SYM 2617](https://kawaii-kaomoji-hub-86.pages.dev/symbol/sym-2617/)
- [SYM 2764 FE0F 200D 1F525](https://cyber-clan-tags-80.pages.dev/symbol/sym-2764-fe0f-200d-1f525/)
- [WHITE HEART](https://gothic-bio-fonts-90.pages.dev/symbol/white-heart/)
- [SYM 1D423](https://synthwave-game-tags-66.pages.dev/symbol/sym-1d423/)
- [MUSIC FLAT SIGN](https://pink-ribbon-fonts-28.pages.dev/symbol/music-flat-sign/)
- [SYM 1D457](https://coquette-aesthetic-symbols-51.pages.dev/symbol/sym-1d457/)
- [SYM 1F613](https://kawaii-kaomoji-hub-16.pages.dev/symbol/sym-1f613/)
- [SYM 26ED](https://mystic-occult-unicode-49.pages.dev/symbol/sym-26ed/)
- [BORDERS DIVIDERS](https://sleek-bio-symbols-40.pages.dev/borders-dividers/)
- [SYM 1D41B](https://zen-arrow-symbols-99.pages.dev/symbol/sym-1d41b/)
- [SYM 26D1](https://zen-unicode-symbols-89.pages.dev/symbol/sym-26d1/)
- [SYM 1F641](https://neon-tech-unicode-43.pages.dev/symbol/sym-1f641/)
- [BLACK FOUR POINT STAR](https://coquette-aesthetic-symbols-51.pages.dev/symbol/black-four-point-star/)
- [SYM 262E](https://anime-sparkle-text-57.pages.dev/symbol/sym-262e/)
- [GAMING WEAPONS](https://mystic-occult-unicode-49.pages.dev/pt/gaming-weapons/)
- [SYM 26D4](https://kawaii-kaomoji-hub-77.pages.dev/symbol/sym-26d4/)
- [GEMINI ZODIAC TWINS](https://dark-poetry-kaomoji-98.pages.dev/symbol/gemini-zodiac-twins/)
- [SYM 1D410](https://daintystar-font-studio-48.pages.dev/symbol/sym-1d410/)
- [SYM 2631](https://neon-glitch-fonts-26.pages.dev/symbol/sym-2631/)
- [SYM 2764 FE0F 200D 1F525](https://bow-ribbon-symbols-72.pages.dev/symbol/sym-2764-fe0f-200d-1f525/)
- [SYM 1F976](https://vintage-angel-text-38.pages.dev/symbol/sym-1f976/)
- [MUSIC WEATHER](https://minimal-star-symbols-22.pages.dev/music-weather/)
- [SYM 1D4A0](https://grimoire-magic-symbols-81.pages.dev/symbol/sym-1d4a0/)
- [SYM 1D410](https://mecha-scifi-symbols-80.pages.dev/symbol/sym-1d410/)
- [ARROWS LINES](https://kawaii-kaomoji-hub-86.pages.dev/arrows-lines/)
- [BORDERS DIVIDERS](https://neon-glitch-fonts-26.pages.dev/es/borders-dividers/)
- [SYM 2637](https://minimal-star-symbols-87.pages.dev/symbol/sym-2637/)
- [SYM 1D41D](https://synthwave-bio-maker-62.pages.dev/symbol/sym-1d41d/)
- [SYM 26A9](https://synthwave-game-tags-66.pages.dev/symbol/sym-26a9/)
- [FREE FIRE CLAN EMPEROR CROWN](https://coquette-aesthetic-symbols-51.pages.dev/symbol/free-fire-clan-emperor-crown/)
- [SYM 1F929](https://baroque-font-vault-96.pages.dev/symbol/sym-1f929/)
- [BRACKETS](https://dark-poetry-kaomoji-98.pages.dev/brackets/)
- [BLACK FOUR POINT STAR](https://otaku-symbol-vault-32.pages.dev/symbol/black-four-point-star/)
- [SYM 2743](https://baroque-aesthetic-symbols-59.pages.dev/symbol/sym-2743/)
- [SYM 1F479](https://clean-line-emojis-93.pages.dev/symbol/sym-1f479/)
- [SYM 1D465](https://gothic-bio-fonts-87.pages.dev/symbol/sym-1d465/)
- [SYM 1F976](https://cyber-clan-tags-36.pages.dev/symbol/sym-1f976/)
- [ROBLOX NAMES](https://cyber-clan-tags-55.pages.dev/ru/roblox-names/)
- [KAOMOJI](https://cyber-clan-tags-36.pages.dev/ja/kaomoji/)
- [SYM 1D491](https://matrix-glitch-text-59.pages.dev/symbol/sym-1d491/)
- [SYM 2642](https://noir-poet-unicode-63.pages.dev/symbol/sym-2642/)
- [MUSIC WEATHER](https://glitch-mecha-kaomoji-69.pages.dev/ja/music-weather/)
- [SYM 1D451](https://anime-sparkle-text-21.pages.dev/symbol/sym-1d451/)
- [SYM 2660](https://clean-unicode-borders-23.pages.dev/symbol/sym-2660/)
- [DISCORD STATUS](https://anime-sparkle-text-89.pages.dev/ja/discord-status/)
- [SYM 2645](https://moe-unicode-corner-53.pages.dev/symbol/sym-2645/)
- [TIKTOK CAPTIONS](https://cyber-clan-tags-20.pages.dev/ja/tiktok-captions/)
- [SYM 2667](https://vintage-scholar-text-15.pages.dev/symbol/sym-2667/)
- [SYM 2689](https://anime-sparkle-text-92.pages.dev/symbol/sym-2689/)
- [SYM 1F47D](https://baroque-fancy-letters-84.pages.dev/symbol/sym-1f47d/)
- [TRENDING](https://cyber-clan-tags-90.pages.dev/ja/trending/)
- [SYM 1D47E](https://neon-matrix-symbols-94.pages.dev/symbol/sym-1d47e/)
- [STARS](https://minimal-star-symbols-87.pages.dev/es/stars/)
- [SYM 2631](https://zen-unicode-symbols-89.pages.dev/symbol/sym-2631/)
- [SYM 1F61A](https://glitch-text-generator-65.pages.dev/symbol/sym-1f61a/)
- [SYM 2611](https://zen-unicode-symbols-89.pages.dev/symbol/sym-2611/)
- [TIBETAN LOTUS BLOSSOM](https://soft-girl-aesthetic-fonts-19.pages.dev/symbol/tibetan-lotus-blossom/)
- [SYM 26CF](https://occult-runic-fonts-23.pages.dev/symbol/sym-26cf/)
- [SYM 1D41C](https://bow-ribbon-symbols-72.pages.dev/symbol/sym-1d41c/)
- [KAOMOJI](https://clean-line-emojis-93.pages.dev/pt/kaomoji/)
- [ARROWS LINES](https://dark-poetry-kaomoji-98.pages.dev/arrows-lines/)
- [STARS](https://classic-typewriter-symbols-19.pages.dev/stars/)
- [GAMING WEAPONS](https://coquette-aesthetic-symbols-77.pages.dev/es/gaming-weapons/)
- [SYM 1D433](https://occult-runic-fonts-23.pages.dev/symbol/sym-1d433/)
- [SYM 1F62A](https://chibi-emoticon-vault-78.pages.dev/symbol/sym-1f62a/)
- [SYM 2617](https://moe-star-kaomoji-82.pages.dev/symbol/sym-2617/)
- [SYM 26F9](https://gothic-bio-fonts-87.pages.dev/symbol/sym-26f9/)
- [NATURE FLOWERS](https://manga-bubble-symbols-54.pages.dev/ja/nature-flowers/)
- [SYM 1D493](https://zen-dot-characters-20.pages.dev/symbol/sym-1d493/)
- [SYM 2671](https://soft-girl-fancy-text-11.pages.dev/symbol/sym-2671/)
- [CROSSED SWORDS](https://ribbon-bow-text-90.pages.dev/symbol/crossed-swords/)
- [SYM 2672](https://zen-unicode-symbols-89.pages.dev/symbol/sym-2672/)
- [SYM 1D417](https://chibi-emoticon-world-87.pages.dev/symbol/sym-1d417/)
- [SYM 1F621](https://kawaii-kaomoji-hub-90.pages.dev/symbol/sym-1f621/)
- [SYM 26A3](https://vintage-library-text-15.pages.dev/symbol/sym-26a3/)
- [SYM 2615](https://minimal-star-symbols-32.pages.dev/symbol/sym-2615/)
- [ANTICLOCKWISE OPEN CIRCLE ARROW](https://poetic-scroll-fonts-91.pages.dev/symbol/anticlockwise-open-circle-arrow/)
- [GAMING WEAPONS](https://angel-core-bios-50.pages.dev/vi/gaming-weapons/)
- [SYM 1F480](https://soft-angel-symbols-36.pages.dev/symbol/sym-1f480/)
- [SYM 26BD](https://cyber-clan-tags-90.pages.dev/symbol/sym-26bd/)
- [FLUTTERING BUTTERFLY](https://mystic-rune-text-88.pages.dev/symbol/fluttering-butterfly/)
- [SYM 1D47E](https://mech-crosshair-symbols-83.pages.dev/symbol/sym-1d47e/)
- [SYM 1F495](https://vintage-script-symbols-11.pages.dev/symbol/sym-1f495/)
- [DISCORD STATUS](https://sleek-mono-fonts-61.pages.dev/pt/discord-status/)
