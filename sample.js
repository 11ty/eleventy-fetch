const startCpu = process.cpuUsage();
const os = require("os");
const saveLocal = require(".");
const AssetCache = saveLocal.AssetCache;

(async () => {
	saveLocal.concurrency = 2;
	let options = {
		duration: "4h"
	};

	let promises = [];

	// don’t await here to test concurrency
	let first = saveLocal("https://www.zachleat.com/img/avatar-2017-big.png", options);
	promises.push(first);
	
	let second = saveLocal("https://www.zachleat.com/img/avatar-2017-big.png", options);
	promises.push(second);

	promises.push(saveLocal("https://www.zachleat.com/web/css/fonts/lato/2.0/LatoLatin-Regular.ttf", options));

	let json = saveLocal("https://opencollective.com/11ty/members/all.json", {
		duration: options.duration,
		type: "json"
	});
	promises.push(json);

	let asset = new AssetCache("twitter-followers-eleven_ty");
	if(asset.isCacheValid("4d")) {
		console.log( "Found cached value" );
		console.log( await asset.getCachedValue() );
	} else {
		console.log( "Saving value" );
		asset.save({ followers: 42 }, "json");
	}
	
	await Promise.all(promises);
	
	console.log( JSON.stringify(await json).substr(0, 100), "… (truncated)" );
	
	console.log( process.cpuUsage(startCpu) );
	console.log( os.freemem() / (1024 * 1024), os.totalmem() / (1024 * 1024) );
	// console.log( process.memoryUsage() );
	// console.log( process.resourceUsage() );
	
})();