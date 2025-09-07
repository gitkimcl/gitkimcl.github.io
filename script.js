var clicks = 0;
function logo_click(e) {
    e.style.animation='none';
    e.offsetHeight;
    e.style.animation='1s test-rotate';
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks<6) {
        killcode = window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
        return;
    } else {
        window.clearTimeout(killcode);
        $("#logo-img").removeClass("tilted");
        $("#title").text("rlachi web");
        $(".hidden-site").removeClass("hidden");
    }
}