const saveLocal = require(".");

(async () => {
	let img = await saveLocal("https://www.zachleat.com/img/avatar-2017-big.png", { duration: "1d" });

	let imgWithoutExt = await saveLocal("https://twitter.com/zachleat/profile_image?size=bigger", { duration: "1d" });

	let font = await saveLocal("https://www.zachleat.com/web/css/fonts/lato/2.0/LatoLatin-Regular.ttf", { duration: "1d" });

	let json = await saveLocal("https://opencollective.com/11ty/members/all.json", { duration: "1d", type: "json" });
	console.log( json );
})();