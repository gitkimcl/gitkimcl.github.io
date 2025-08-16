var clicks = 0;
function logo_click(e) {
    e.style.animation='none';
    e.offsetHeight;
    e.style.animation='1s test-rotate';
    clicks++;
    console.log(`ecyc ${clicks}`);
    if (clicks<6) {
        window.setTimeout(function() {
            if (clicks < 6) {
                clicks = 0;
            }
        }, 1000);
    } else {
        if (clicks%4==2) {
            $("#logo-img").removeClass("tilted");
            $("#title").text("rlachi web");
            $(".hidden-site").removeClass("hidden");
        } else if (clicks%4==0) {
            $("#logo-img").addClass("tilted");
            $("#title").text("kimcl web");
            $(".hidden-site").addClass("hidden");
        }
    }
}