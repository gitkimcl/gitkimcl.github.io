var clicks = 0;
var hue = 0;
function logo_click(e) {
    hue += 360;
    e.style.filter = `hue-rotate(${hue}deg)`;
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