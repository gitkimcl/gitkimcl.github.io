var clicks = 0;
function logo_click() {
    $("#logo-img").css("animation", "none");
    $("#logo-img").offset();
    $("#logo-img").css("animation", "1s test-rotate");
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks>6) return;
    if (clicks==6) {
        $("#logo-img").removeClass("tilted");
        $("#title").text("rlachi web");
        $(".hidden-site").removeClass("hidden");
        return;
    }
    window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
}