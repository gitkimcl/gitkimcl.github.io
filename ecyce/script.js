$(".title-row").css("animation","6s ease title");

$(".title-row").on("animationend", () => {
    $(".title-row").css("animation","none");
    $("main").addClass("on");
});

if (localStorage.getItem("lesspower")=="1") {
    $("main").addClass("restricted");
}

function togglePower() {
    if (localStorage.getItem("lesspower")=="1") {
        localStorage.setItem("lesspower","0");
        $("main").removeClass("restricted");
    } else {
        localStorage.setItem("lesspower","1");
        $("main").addClass("restricted");
    }
}

var clicks = 0;
function logo_click() {
    $(".title-row").css("animation","none");
    $("main").addClass("on");
    $("main").css("animation", "none");
    $("main").offset();
    $("main").css("animation", "1s test-rotate");
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