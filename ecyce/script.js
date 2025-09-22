$(".title-row").css("animation","6s ease title");

$(".title-row").on("animationend", () => {
    $(".title-row").css("animation","none");
    $(":root").addClass("on");
});

if (localStorage.getItem("lesspower")=="1") {
    $(":root").addClass("restricted");
}

function togglePower() {
    if (localStorage.getItem("lesspower")=="1") {
        localStorage.setItem("lesspower","0");
        $(":root").removeClass("restricted");
    } else {
        localStorage.setItem("lesspower","1");
        $(":root").addClass("restricted");
    }
}

var clicks = 0;
function logo_click() {
    $(".title-row").css("animation","none");
    $(":root").addClass("on");
    $(".logo, .bg").css("animation", "none");
    $(".logo, .bg").offset();
    $(".logo, .bg").css("animation", "1s test-rotate");
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks>6) return;
    if (clicks==6) {
        $("#logo-img").attr("src","img/cycarchivelogo.png");
        $(".bg").addClass("bg-archive");
        $(".title-row-bg").addClass("bg-archive");
        $(".rows").addClass("bg-archive");
        return;
    }
    window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
}