$("header").css("animation","6s ease title");

$("header").on("animationend", () => {
	$("header").css("animation","none");
	$(":root").addClass("on");
	$("#titlewrapper").attr("hidden","hidden");
});

if (localStorage.getItem("kimclweb.lesspower")==="1") {
	$(":root").addClass("restricted");
}

function togglePower() {
	if (localStorage.getItem("kimclweb.lesspower")==="1") {
		localStorage.setItem("kimclweb.lesspower","0");
		$(":root").removeClass("restricted");
	} else {
		localStorage.setItem("kimclweb.lesspower","1");
		$(":root").addClass("restricted");
	}
}

function logo_click(e) {
	$("header").css("animation","none");
	$(":root").addClass("on");
	$("#titlewrapper").attr("hidden","hidden");
	$(".logo, .bg").css("animation", "none");
	$(".logo, .bg").offset();
	$(".logo, .bg").css("animation", "1s hue-rotate");
	console.log(`ecyc ${e.detail}`);
	if (e.detail<6) return;
	$("#logo-img").attr("src","img/cycarchivelogo.png");
	$(".bg").addClass("bg-archive");
	$("header-bg").addClass("bg-archive");
	$("main.tiles").addClass("bg-archive");
	$(".archivetile").attr("href", function () { return $(this).attr("data-archive"); });
	$(".intro-normal").css("display","none");
	$(".intro-archive").css("display","unset");
	$("#about1").attr("href", ".");
}