import { fetchget } from '../../global/util.js';
import { d$, deco, get_p, get_navp, format_date } from './util.js';
import { remove_dialog } from './dialog.js';
import { make_edit_buttons, make_init_buttons } from './editui.js';

const EDIT_FLAG = !!(new URLSearchParams(window.location.search).get("edit"));

function highlight(el) {
	if (el.tagName === "SECTION") {
		el.querySelector("h2").scrollIntoView({block: "center"});
	} else {
		el.scrollIntoView({block: "center"});
	}
	el.style.animation = 'none';
	el.offsetHeight;
	el.style.animation = "bg-flash 0.5s ease-out";
}

export function load_fragment() {
	let h = window.location.hash;
	if (!h || h === "#") return;
	if (d$("dialog")) remove_dialog(d$("dialog"));
	let target = null;
	if (h.startsWith("#w")) {
		target = $(`section[data-wid="${parseInt(h.slice(2))}"]`).get(0);
	} else if (h.startsWith("#a")) {
		target = $(`.e[value="${parseInt(h.slice(2))}"]`).parent().get(0);
	} else if (h.startsWith("#p")) {
		target = $(`.p[data-pid="${parseInt(h.slice(2))}"]`).get(0);
	}
	if (target != null) {
		highlight(target);
		return;
	}
	if (h.startsWith("#w")) {
		let wid = parseInt(h.slice(2));
		load_week(wid).then(() => {
			highlight(document.querySelector(h));
		}).catch(() => console.log("업서요"));
	} else if (h.startsWith("#a")) {
		let aid = parseInt(h.slice(2));
		fetchget(`/cycelog/find/week?a=${aid}`).then((id) => load_week(id)).then(() => {
			highlight(document.querySelector(h).parentElement);
		}).catch(() => console.log("업서요"));
	} else if (h.startsWith("#p")) {
		let pid = parseInt(wh.slice(2));
		fetchget(`/cycelog/find/week?p=${pid}`).then((id) => load_week(id)).then(() => {
			highlight(document.querySelector(h).parentElement);
		}).catch(() => console.log("업서요"));
	}
}
window.onhashchange = load_fragment;

export function to_fragment_a() {
	if (window.location.hash === this.attributes['href'].value) load_fragment();
}

export function to_fragment(to) {
	if (window.location.hash === to) load_fragment();
	else window.location.hash = to;
}

export async function load_week(id) {
	console.log(id);
	if (loaded.includes(id)) return;
	let res = await fetchget(`/cycelog/week?id=${id}`);

	let tmp = $(`<section data-wid="${res.data.id}" data-order="${res.data.order}">`);
	tmp.append($("#newweek").clone().contents());
	let title = $(`<h2>${res.data.name}</h2>`);
	wio?.observe(title.get(0));
	$("#weekname", tmp).replaceWith(title);
	$("#weekstart", tmp).replaceWith(`<time class="weekstart" datetime="${res.data.start_date}">${format_date(res.data.start_date)}</time>`);
	$("#weekend", tmp).replaceWith(`<time class="weekend" datetime="${res.data.end_date}">${format_date(res.data.end_date)}</time>`);
	$("#weekwrite", tmp).replaceWith(`<time class="weekwrite" datetime="${res.data.write_start_date}">${format_date(res.data.write_start_date, true)} ~ </time>`);
	$("#weekcode", tmp).replaceWith(`<data class="weekcode" value="${res.data.code}">${res.data.code.toString().padStart(3,'0')}</data>`);
	$(".to-top", tmp).on("click", () => to_fragment(`#w${tmp.attr("data-wid")}`));
	let nav = $(`<div class="navweek nw${res.data.code%10}" data-wid="${res.data.id}" data-order="${res.data.order}">`);
	load_week_contents(tmp, nav, res);

	if (!$("section").length) {
		$("body").append(tmp);
		$("nav").append(nav);
	} else {
		let found = false;
		let secs = $("section");
		let navs = $(".navweek");
		for (let e in secs.get()) {
			if ($(secs[e]).attr("data-order") > res.data.order) {
				$(secs[e]).before(tmp);
				$(navs[e]).before(nav);
				found = true;
				break;
			}
		}
		if (!found) {
			$("body").append(tmp);
			$("nav").append(nav);
		}
	}

	if (res.data.order === 0) $(".cr_before",tmp).addClass("hidden");
	if (parseInt(tmp.prev().attr("data-order"))+1 === res.data.order) {
		$(".cr_after",tmp.prev()).addClass("hidden");
		$(".cr_before",tmp).addClass("hidden");

		$(".nwend",nav.prev()).addClass("invis");
	} else if (parseInt(tmp.prev().attr("data-order"))+2 === res.data.order) {
		$(".cr_after",tmp.prev()).addClass("hidden");
		$(".loadbefore > svg > use",tmp).attr("href", "#between");
	}
	if (parseInt(tmp.next().attr("data-order"))-1 === res.data.order) {
		$(".cr_before",tmp.next()).addClass("hidden");
		$(".cr_after",tmp).addClass("hidden");

		$(".nwend",nav).addClass("invis");
	} else if (parseInt(tmp.next().attr("data-order"))-2 === res.data.order) {
		$(".cr_before",tmp.next()).addClass("hidden");
		$(".loadafter > svg > use",tmp).attr("href", "#between");
	}
	$(".loadbefore",tmp).on("click", function () { load_from_button(res.data.order-1, this); });
	$(".loadafter",tmp).on("click", function () { load_from_button(res.data.order+1, this); });

	loaded.push(res.data.id);
	if (init_weeks !== -1) {
		cur_weeks++;
		if (cur_weeks === init_weeks) {
			load_fragment();
			init_weeks = -1;
		}
	}
	return tmp;
}

export async function reload_week(id) {
	console.log("r: "+id);
	if (!loaded.includes(id)) throw "아니 로드도 안하고 리로드를 왜 시킴";
	let res = await fetchget(`/cycelog/week?id=${id}`);
	let el = $(`section[data-wid="${id}"]`);
	let nav = $(`.navweek[data-wid="${res.data.id}"]`);
	$(".p", el).remove();
	$(`.ndata`, nav).remove();
	load_week_contents(el, nav, res);
	return el;
}

async function load_from_button(order, button) {
	try {
		let id = await fetchget(`/cycelog/find/week?order=${order}`);
		let res = await load_week(id);
		return res;
	} catch (e) {
		$(" > svg > use",button).attr("href", "#x");
		$(button).addClass("loadnothing");
		$(button).off("click");
	}
	return null;
}

function load_week_contents(el, nav, res) {
	nav.append($(`<a class="ndata nwstart" href="#w${res.data.id}" data-wid="${res.data.id}"><span class="ndesc">${res.data.name}</span></a>`))
	for (let e of res.p) {
		let p = get_p(e.id, e.content);
		let np = get_navp(p, e.id, e.content);
		pio?.observe(p.get(0));
		$(".to-top", el).before(p);
		nav.append(np);
	}
	nav.append($(`<div class="ndata nwend"></div>`));
	$(".ndata:not(.nwend)",nav).on("click", to_fragment_a);
	deco(el);
	if (EDIT_FLAG) make_edit_buttons(el);
}

var init_weeks = -1
var cur_weeks = 0
var loaded = [];
export function load_weeks() {
	fetchget("/cycelog/weeks").then((res) => {
		init_weeks = res.length;
		if (init_weeks === 0) {
			load_fragment();
			if (EDIT_FLAG) make_init_buttons();
			return;
		}
		for (let e of res) load_week(e);
	});
}

const NAV_ON = ($(":root").css("--nav-on")!="0");
if (!NAV_ON) $("aside").remove();

function update_nav_scroll() {
	let p = null;
	let x = window.innerWidth/2, y = window.innerHeight/2;
	while (p == null) {
		if (y <= 0) break;
		p = document.elementFromPoint(x, y);
		if (p.tagName === 'H2') {
			p = p.parentElement.parentElement;
			$(`.nwstart[data-wid="${p.attributes['data-wid'].value}"]`).get(0)
				.scrollIntoView({'block': 'center'});
			return;
		}
		p = p.closest(".p");
		y -= 5;
	}
	if (p == null) return;
	$(`.nwp[data-pid="${p.attributes['data-pid'].value}"]`).get(0)
		.scrollIntoView({'block': 'center'});
}
if (NAV_ON) window.onscroll = update_nav_scroll;

const pio = NAV_ON ? new IntersectionObserver((es) => {
	for (let e of es) {
		let pid = e.target.attributes['data-pid'].value;
		if (e.isIntersecting) $(`.nwp[data-pid="${pid}"]`).addClass("inview");
		else $(`.nwp[data-pid="${pid}"]`).removeClass("inview");
	}
}) : null;

const wio = NAV_ON ? new IntersectionObserver((es) => {
	for (let e of es) {
		let wid = e.target.parentElement.parentElement.attributes['data-wid'].value;
		if (e.isIntersecting) $(`.nwstart[data-wid="${wid}"]`).addClass("inview");
		else $(`.nwstart[data-wid="${wid}"]`).removeClass("inview");
	}
}) : null;