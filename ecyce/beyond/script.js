if (localStorage.getItem("kimclweb.lesspower")==="1") $(":root").addClass("restricted");
$("#wrapper").on("scroll", () => {
	console.log($("#wrapper").scrollTop());
	if ($("#wrapper").scrollTop() > 490000) {
		document.getElementById("wrapper").scrollBy({ top: -840*16, behavior: "instant" });
	}
})