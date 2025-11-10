import { fetchget } from '../../global/util.js';
import { d$, deco, get_p, format_date } from './util.js';
import { remove_dialog } from './dialog.js';
import { make_edit_buttons, make_init_buttons } from './editui.js';

const EDIT_FLAG = new URL(import.meta.url).searchParams.get('edit') ?? false;

function highlight(el) {
	el.scrollIntoView({block: "nearest"});
	el.style.animation = 'none';
	el.offsetHeight;
	el.style.animation = "bg-flash 0.5s ease-out";
}

function load_fragment() {
	if (!window.location.hash) return;
	if (d$("dialog")) remove_dialog(d$("dialog"));
	if (!document.querySelector(window.location.hash)) {
		/* TODO: 서버에서 내용 가져오기 */
		if (window.location.hash.startsWith("#w")) {
			let wid = parseInt(window.location.hash.slice(2));
			load_week(wid).then(() => {
				highlight(document.querySelector(window.location.hash));
			});
			return;
		} else if (window.location.hash.startsWith("#a")) {
			let aid = parseInt(window.location.hash.slice(2));
			fetchget(`/cycelog/find/week?a=${aid}`).then((id) => load_week(id)).then(() => {
				highlight(document.querySelector(window.location.hash).parentElement);
			}).catch(() => console.log("업서요"));
			return;
		} else if (window.location.hash.startsWith("#p")) {
			let pid = parseInt(window.location.hash.slice(2));
			fetchget(`/cycelog/find/week?p=${pid}`).then((id) => load_week(id)).then(() => {
				highlight(document.querySelector(window.location.hash).parentElement);
			}).catch(() => console.log("업서요"));
			return;
		}
		console.log("업서요");
	}
	let target = document.querySelector(window.location.hash);
	if (target.classList.contains("e")) target = $(target).closest(".p").get(0);
	highlight(target);
}
window.onhashchange = load_fragment;

export function to_fragment(to) {
	window.location.hash = "";
	window.location.hash = `#a${to}`;
	load_fragment();
}

export async function load_week(id, code, order, button) {
	console.log(id);
	try {
		let res = await fetchget(id?`/cycelog/week?id=${id}`:(code?`/cycelog/week?code=${code}`:`/cycelog/week?order=${order}`));
		if (loaded.includes(res.data.id)) return;
		let tmp = $(`<section data-wid="${res.data.id}" data-order="${res.data.order}" id="w${res.data.id}">`);
		tmp.append($("#newweek").clone().contents());
		$("#weekname", tmp).replaceWith(`<h2>${res.data.name}</h2>`);
		$("#weekstart", tmp).replaceWith(`<time class="weekstart" datetime="${res.data.start_date}">${format_date(res.data.start_date)}</time>`);
		$("#weekend", tmp).replaceWith(`<time class="weekend" datetime="${res.data.end_date}">${format_date(res.data.end_date)}</time>`);
		$("#weekwrite", tmp).replaceWith(`<time class="weekwrite" datetime="${res.data.write_start_date}">${format_date(res.data.write_start_date, true)} ~ </time>`);
		$("#weekcode", tmp).replaceWith(`<data class="weekcode" value="${res.data.code}">${res.data.code.toString().padStart(3,'0')}</data>`);
		for (let e of res.p) $(".to-top", tmp).before(get_p(e.id, e.content));
		deco(tmp);
		$(".to-top", tmp).on("click", function() { window.location.hash = ''; window.location.hash=`#w${tmp.attr("data-wid")}`; for (let e of window.cr_onafterload) e(); });
		if (EDIT_FLAG) make_edit_buttons(tmp);
		if (!$("section").length) {
			$("body").append(tmp);
			if (res.data.order === 0) $(".cr_before",tmp).addClass("hidden");
			if (parseInt(tmp.prev().attr("data-order"))+1 === res.data.order) {
				$(".loadafter",tmp.prev()).addClass("hidden");
				$(".loadbefore",tmp).addClass("hidden");
			} else if (parseInt(tmp.prev().attr("data-order"))+2 === res.data.order) {
				$(".loadafter",tmp.prev()).addClass("hidden");
				$(".loadbefore > svg > use",tmp).attr("href", "#between");
			}
		} else {
			let cur = $("section");
insert:		{
				for (let e of cur) {
					if ($(e).attr("data-order") > res.data.order) {
						$(e).before(tmp);
						break insert;
					}
				}
				$("body").append(tmp);
			}
			if (res.data.order === 0) $(".cr_before",tmp).addClass("hidden");
			if (parseInt(tmp.prev().attr("data-order"))+1 === res.data.order) {
				$(".cr_after",tmp.prev()).addClass("hidden");
				$(".cr_before",tmp).addClass("hidden");
			} else if (parseInt(tmp.prev().attr("data-order"))+2 === res.data.order) {
				$(".cr_after",tmp.prev()).addClass("hidden");
				$(".loadbefore > svg > use",tmp).attr("href", "#between");
			}
			if (parseInt(tmp.next().attr("data-order"))-1 === res.data.order) {
				$(".cr_before",tmp.next()).addClass("hidden");
				$(".cr_after",tmp).addClass("hidden");
			} else if (parseInt(tmp.next().attr("data-order"))-2 === res.data.order) {
				$(".cr_before",tmp.next()).addClass("hidden");
				$(".loadafter > svg > use",tmp).attr("href", "#between");
			}
		}
		$(".loadbefore",tmp).on("click", function () { load_week(undefined, undefined, res.data.order-1, this); });
		$(".loadafter",tmp).on("click", function () { load_week(undefined, undefined, res.data.order+1, this); });
		loaded.push(res.data.id);
		if (init_weeks !== -1) {
			cur_weeks++;
			if (cur_weeks === init_weeks) {
				init_weeks = -1; // 재귀 방지
				load_fragment();
			}
		}
		return tmp;
	} catch (e) {
		console.error(e);
		$(" > svg > use",button).attr("href", "#x");
		$(button).addClass("loadnothing");
		$(button).off("click");
	}
	return null;
}

export async function reload_week(id) {
	console.log("r: "+id);
	try {
		let res = await fetchget(`/cycelog/week?id=${id}`);
		if (!loaded.includes(res.data.id)) throw "아니 로드도 안하고 리로드를 왜 시킴";
		let el = $(`section[data-wid=${id}]`);
		$(".p", el).remove();
		for (let e of res.p) $(".to-top", el).before(get_p(e.id, e.content));
		deco(el);
		if (EDIT_FLAG) make_edit_buttons(el);
		return el;
	} catch (e) {
		console.error(e);
	}
	return null;
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