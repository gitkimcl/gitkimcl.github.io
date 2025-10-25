$("header").css("animation","6s ease title");

$("header").on("animationend", anim_end);

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

function anim_end() {
	$("header").css("animation","none");
	$(":root").addClass("on");
	$("#titlewrapper").attr("hidden","hidden");
	calc_fillers();
}

function logo_click(e) {
	$(".logo, .bg").css("animation", "none");
	anim_end();
	$(".logo, .bg").offset();
	$(".logo, .bg").css("animation", "1s hue-rotate");
	console.log(`ecyc ${e.detail}`);
	if (e.detail<6) return;
	$("#logo-img").attr("src","img/cycarchivelogo.png");
	$(".bg, .header-bg, main.tiles").addClass("bg-archive");
	$(".archivetile").attr("href", function() { return $(this).attr("data-archive"); });
	$(".intro-normal").css("display","none");
	$(".intro-archive").css("display","unset");
	$("#about1").attr("href", ".");
}

$(window).on("resize", calc_fillers);

var cur_cols = -1;
function calc_fillers() {
	let cols = $("main.tiles").css("grid-template-columns").split(" ").length;
	if (cur_cols === cols) return;
	cur_cols = cols;
	let fillers = [0,0,0,0];
	switch (cols) {
		case 6:
			fillers = [1,1,1,1]; break;
		case 5:
			fillers = [3,1,1,0]; break;
		case 4:
			fillers = [3,0,0,0]; break;
	}
	console.log(fillers);
	$(`.tile.filler-tile`).slice(0,fillers[0]).css("display","block");
	$(`.tile.filler-tile`).slice(fillers[0]).css("display","none");
	$(`.tile.filler-wide`).slice(0,fillers[1]).css("display","block");
	$(`.tile.filler-wide`).slice(fillers[1]).css("display","none");
	$(`.tile.filler-tall`).slice(0,fillers[2]).css("display","block");
	$(`.tile.filler-tall`).slice(fillers[2]).css("display","none");
	$(`.tile.filler-big`).slice(0,fillers[3]).css("display","block");
	$(`.tile.filler-big`).slice(fillers[3]).css("display","none");
}