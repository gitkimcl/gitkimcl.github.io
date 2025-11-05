import { fetchget } from '../../global/util.js';

export function sani(str) {
	// 실수를 막는 거지 보안용은 아님
	// 이거 개인 프로젝트임
	return str.replaceAll("&","&amp;").replaceAll("\"","&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

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
		}
		console.log("업서요");
	}
	let target = document.querySelector(window.location.hash)
	if (target.tagName === 'A') target = target.parentElement;
	highlight(target);
}
window.onhashchange = load_fragment;
window.cr_onafterload = [load_fragment];

// selectable text
export function deco(el) {
	$(".e", el).before(" "); // hair space
	$(".e", el).prepend($(`<span class="before">#</span>`));
	$(".e.ref > .before", el).text("ref. #"); // 6-per-em space
	$(".e.add > .before", el).text("Add");
	$(".e.add1 > .before", el).text("Add1");
	$(".e.add3 > .before", el).text("Add3");
	$("b.star", el).prepend("★").append("★");
	$("q:not(.exact, .star)", el).prepend("'").append("'");
	$("q.exact", el).prepend("\"").append("\"");;
	$("q.star", el).prepend("★").append("★");;
	$("span.wrapper.paren", el).prepend("(").append(" )"); // hair space
	$("span.namu", el).append("(...)");
	$("span.qm", el).text("?");
	$("data, time, span.qm", el).on("click", (e) => {
		attach_dialog(e.currentTarget, e.clientY);
		e.stopPropagation();
	}); // dialog
}
deco(undefined);

const d$ = (q) => document.getElementById(q);


$(window).on("resize", () => {
	if (!cur_el) return;
	move_dialog();
});

var cur_el = null;
var cur_box = null;
export function attach_dialog(el, clicky) {
	$("#dialog").css("opacity",0).addClass("closing").removeAttr("id");
	let rects = el.getClientRects();
	if (clicky != null) {
		let new_box = null;
		for (let i in rects) {
			let e = rects[i];
			if (e.top <= clicky && clicky <= e.bottom) {
				new_box = i;
				break;
			}
		}
		if (cur_el === el && cur_box === new_box) {
			$("#dialog").css("opacity",0).addClass("closing").removeAttr("id");
			$(".selected").removeClass("selected");
			cur_el = cur_box = null;
			return;
		}
		cur_box = new_box;
	}
	$(".selected").removeClass("selected");
	$(el).addClass("selected");
	cur_el = el;
	create_dialog();
	move_dialog();
	d$("dialog").showPopover({'source':cur_el});
	$("#dialog").css($(el).css(['--c','--ch','--ca','--bd','--bdh','--bda','--bg','--bgh','--bga']));
}

function move_dialog() {
	let rect = cur_el.getClientRects()[cur_box ?? 0];
	let x = window.scrollX + rect.x + rect.width/2;
	let y = window.scrollY + rect.bottom + 4;
	let vx = window.innerWidth;
	let dw = $("#dialog").innerWidth();
	if (x < dw/2+12) x = dw/2 + 12;
	if (x > vx-dw/2-12) x = vx-dw/2 - 12;
	$("#dialog").css("left", `${x}px`).css("top",`${y}px`);
}

function dialog_base() {
	let d = $(`<dialog id="dialog" popover></dialog>`);
	d.on("toggle", function (e) {
		if (e.originalEvent.newState === "closed") {
			remove_dialog(this);
		}
	}).on("transitionend", function () {
		if (this.classList.contains("closing")) this.remove();
	});
	return d;
}

function create_dialog() {
	let el = $(cur_el);
	if (el.hasClass("e")) {
		if (el.hasClass("add")) {
			$("body").append(dialog_base().append(`<span>수첩 기록 시엔 없었으나<br>
				${(el.hasClass("add3")?"3차 기록 중":(el.hasClass("add1")?"1차 기록 중":"이후"))} 추가한 내용</span>`));
			return;
		}
		if (el.hasClass("ref")) {
			$("body").append(dialog_base().append(`<span>${el.val()}번 기록 언급<br></span>
				<button type="button" onclick="to_fragment(${el.val()})">이동</button>`));
			return;
		}
		$("body").append(dialog_base().append(`<span>${el.val()}번 기록<br></span>
			<button type="button" onclick="navigator.clipboard.writeText(\`\${window.location.host}\${window.location.pathname}#a${el.attr("data-for")}\`);">링크 복사</button>`));
		return;
	}
	if (el.hasClass("qm")) {
		$("body").append(dialog_base().append(`<span>${el.attr("data-why") ?? "진위 여부나 단어 선택의 적절성을 검증하지 않음"}</span>`));
		return;
	}
	if (el.hasClass("person")) {
		// TODO: 이름 가져오기
		// TODO: 사람 모아보기 기능
		$("body").append(dialog_base().append(`<span>${el.val()} · ${"대충 이름"}<br></span>
			<button type="button">더 보기</button>`));
		return;
	}
	if (el.hasClass("placeholder")) {
		$("body").append(dialog_base().append(`<span>텍스트로 나타낼 수 없어 대체된 내용</span>
			${el.val() && `<br>
			<span>${el.val()}</span>`}`));
		return;
	}
	if (cur_el.tagName === 'TIME') {
		// TODO: 시간 포매팅
		$("body").append(dialog_base().append(`<span>${el.attr("data-time") ? el.attr("data-time") : el.attr("datetime")??"시간 표시"}</span>`));
		return;
	}
	if (el.hasClass("weekcode")) {
		// TODO: 주차 이름 가져오기
		$("body").append(dialog_base().append(`<span>${el.val()} · ${"대충 이름"}<br></span>`));
		return;
	}
	$("body").append(dialog_base().append(`<span>???</span>`));
	return;
}

function remove_dialog(e) {
	if (e.id !== "dialog") return;
	$(e).css("opacity",0).addClass("closing").removeAttr("id");
	$(".selected").removeClass("selected");
	cur_el = cur_box = null;
}


export function to_fragment(to) {
	window.location.hash = "";
	window.location.hash = `#a${to}`;
	load_fragment();
}
window.to_fragment = to_fragment;


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
		if (window.cr_onloadweek) cr_onloadweek(tmp);
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
			if (cur_weeks === init_weeks && window.cr_onafterload) {
				let weeks = init_weeks;
				init_weeks = -1; // 재귀 방지
				for (let e of window.cr_onafterload) e(weeks);
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
		if (window.cr_onloadweek) cr_onloadweek(el);
		return el;
	} catch (e) {
		console.error(e);
	}
	return null;
}

export function get_p(id, content) {
	if (content.startsWith("<!--OUTER-->")) return $(content).last().addClass("p").addClass("htmlp").attr("data-pid",id);
	return $(`<p class="p" data-pid="${id}">${content}</p>`);
}

export function format_date(d, time, year) {
	// TODO
	let da = new Date(d);
	return `${year ? `${da.getFullYear().toString().padStart(4,"0")}. ` : ''}${(da.getMonth()+1).toString().padStart(2,"0")}. ${da.getDate().toString().padStart(2,"0")}.${time ? ` (${da.getHours().toString().padStart(2,"0")}:${da.getMinutes().toString().padStart(2,"0")})` : ''}`;
}

var init_weeks = -1
var cur_weeks = 0
var loaded = [];
fetchget("/cycelog/weeks").then((res) => {
	init_weeks = res.length;
	if (init_weeks === 0 && window.cr_onafterload) for (let e of window.cr_onafterload) e(0);
	for (let e of res) {
		load_week(e);
	}
});