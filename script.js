var clicks = 0;
var hue = 0;
var prevhue = 0;
function logo_click(e) {
    if (prevhue==hue) hue += 360;
    window.setTimeout(() => { prevhue = hue; }, 500);
    $("#logo-img").css("filter", `hue-rotate(${hue}deg)`);
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks<6) {
        killcode = window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
        return;
    } else {
        $("#logo-img").removeClass("tilted");
        $("#title").text("rlachi web");
        $(".hidden-site").removeClass("hidden");
    }
}