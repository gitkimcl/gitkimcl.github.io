function logo_click(e) {
	$("#logo-img").css("animation", "none");
	$("#logo-img").offset();
	$("#logo-img").css("animation", "1s hue-rotate");
	console.log(`ecyc ${e.detail}`);
	if (e.detail < 6) return;
	$("#logo-img").removeClass("tilted");
	$("#title").text("rlachi server");
}