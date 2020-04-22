const saveLocal = require(".");
const AssetCache = saveLocal.AssetCache;

(async () => {
	saveLocal.concurrency = 2;
	let options = {
		duration: "4h"
	};

	let promises = [];

	// don’t await here to test concurrency
	promises.push(saveLocal("https://www.zachleat.com/img/avatar-2017-big.png", options));

	promises.push(saveLocal("https://twitter.com/eleven_ty/profile_image?size=bigger", options));
	promises.push(saveLocal("https://twitter.com/nejsconf/profile_image?size=bigger", options));
	promises.push(saveLocal("https://twitter.com/nebraskajs/profile_image?size=bigger", options));
	promises.push(saveLocal("https://twitter.com/netlify/profile_image?size=bigger", options));
	promises.push(saveLocal("https://twitter.com/zachleat/profile_image?size=bigger", options));

	promises.push(saveLocal("https://www.zachleat.com/web/css/fonts/lato/2.0/LatoLatin-Regular.ttf", options));

	let json = saveLocal("https://opencollective.com/11ty/members/all.json", {
		duration: options.duration,
		type: "json"
	});
	promises.push(json);

	let asset = new AssetCache("twitter-followers-eleven_ty");
	if(asset.isCacheValid("4d")) {
		console.log( "Found cached value" );
		console.log( asset.getCachedValue() );
	} else {
		console.log( "Saving value" );
		asset.save({ followers: 42 }, "json");
	}


	await Promise.all(promises);

	console.log( JSON.stringify(await json).substr(0, 100), "… (truncated)" );
})();