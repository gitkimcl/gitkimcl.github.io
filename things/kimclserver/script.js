var clicks = 0;
function logo_click() {
	$("#logo-img").css("animation", "none");
	$("#logo-img").offset();
	$("#logo-img").css("animation", "1s hue-rotate");
	clicks++;
	console.log(`ecyc ${clicks}`);
	if (clicks>6) return;
	if (clicks==6) {
		$("#logo-img").removeClass("tilted");
		$("#title").text("rlachi server");
		return;
	}
	window.setTimeout(() => { if (clicks<6) clicks = 0; }, 1000);
}

$ = document.getElementById.bind(document);

let connected = false;

function connect() {
	let url = localStorage.getItem("server.url");
	$("serverurl").textContent = (!url)?"[없음]":url;
	$("serverurl").setAttribute("title", (!url)?"[없음]":url);
	$("statcolor").style.color = "var(--c-o-text)";
	$("serverstatus").textContent = "연결중";
	$("serverping").textContent = "---";
	$("serverhide").classList.add("invis");
	connected = false;
	if (url == null) {
		alert(null);
	} else {
		fetch(`${url}/ping`)
		.then((res) => {
			return res.text();
		}).then((re) => {
			let data = JSON.parse(re);
			if (data['ecyc'] !== 'e') {
				throw SyntaxError("fail");
			}
			$("statcolor").style.color = "var(--c-g-text)";
			$("serverstatus").textContent = "연결됨";
			$("serverping").textContent = `${Math.round(Date.now() - data['time']*1000)}ms`;
			$("serverhide").classList.remove("invis");
			connected = true;
		}).catch((e) => {
			$("statcolor").style.color = "var(--c-r-text)";
			$("serverstatus").textContent = "연결 실패";
			$("serverping").textContent = "---";
			console.error(e);
		});
	}
}

function changeurl() {
	let newurl = $("newurl").value;
	if (!newurl) {
		alert("url이 비어 있습니다.");
		return;
	}
	localStorage.setItem("server.url", newurl);
	connect();
}

connect();