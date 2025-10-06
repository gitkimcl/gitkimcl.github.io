$("header").css("animation","6s ease title");

$("header").on("animationend", () => {
    $("header").css("animation","none");
    $(":root").addClass("on");
});

if (localStorage.getItem("lesspower")==="1") {
    $(":root").addClass("restricted");
}

function togglePower() {
    if (localStorage.getItem("lesspower")==="1") {
        localStorage.setItem("lesspower","0");
        $(":root").removeClass("restricted");
    } else {
        localStorage.setItem("lesspower","1");
        $(":root").addClass("restricted");
    }
}

var clicks = 0;
function logo_click() {
    $("header").css("animation","none");
    $(":root").addClass("on");
    $(".logo, .bg").css("animation", "none");
    $(".logo, .bg").offset();
    $(".logo, .bg").css("animation", "1s hue-rotate");
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks>6) return;
    if (clicks==6) {
        $("#logo-img").attr("src","img/cycarchivelogo.png");
        $(".bg").addClass("bg-archive");
        $("header-bg").addClass("bg-archive");
        $("main.tiles").addClass("bg-archive");
        return;
    }
    window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
}