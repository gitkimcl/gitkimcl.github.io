var clicks = 0;
var killcode = null;
function logo_click(e) {
    if (clicks >= 6) return;
    e.style.animation='none';
    e.offsetHeight;
    e.style.animation='1s test-rotate';
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks<6) {
        if (killcode!==null) window.clearTimeout(killcode);
        killcode = window.setTimeout(() => { clicks = 0; }, 1000);
        return;
    } else {
        if (killcode!==null) window.clearTimeout(killcode);
        $("#logo-img").removeClass("tilted");
        $("#title").text("rlachi web");
        $(".hidden-site").removeClass("hidden");
    }
}