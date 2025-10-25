var clicks = 0;
function logo_click(e) {
	$("#logo-img").css("animation", "none");
	$("#logo-img").offset();
	$("#logo-img").css("animation", "1s hue-rotate");
	clicks++;
	window.setTimeout(() => { if (clicks<6) clicks=0; }, 1000);
	if (clicks<6) return;
	$("#logo-img").removeClass("tilted");
	$("#title").text("rlachi server");
}