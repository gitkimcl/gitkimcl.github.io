import { fetchget } from '../../global/util.js';

function highlight(el) {
	el.scrollIntoView();
	el.style.animation = 'none';
	el.offsetHeight;
	el.style.animation = "bg-flash 0.5s ease-out";
}

function load_anchor() {
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
window.onhashchange = load_anchor;
window.cr_onafterload = [load_anchor];

// selectable text
export function deco(el) {
	$("a", el).before(" "); // hair space
	$("a", el).prepend($(`<span class="before">#</span>`));
	$("a.ref > .before", el).text("ref. #"); // 6-per-em space
	$("a.add > .before", el).text("Add");
	$("a.add1 > .before", el).text("Add1");
	$("a.add3 > .before", el).text("Add3");
	$("b.star", el).prepend("★").append("★");
	$("q:not(.exact, .star)", el).prepend("'").append("'");
	$("q.exact", el).prepend("\"").append("\"");;
	$("q.star", el).prepend("★").append("★");;
	$("span.wrapper.paren", el).prepend("(").append(" )"); // hair space
	$("span.namu", el).append("(...)");
	$("span.qm", el).text("?");
	$("a, data, time, span.qm", el).on("click", (e) => {
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
function attach_dialog(el, clicky) {
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
	if (cur_el.tagName === 'A') {
		if (el.hasClass("add")) {
			$("body").append(dialog_base().append(`<span>수첩 기록 시엔 없었으나<br>
				${(el.hasClass("add3")?"3차 기록 중":(el.hasClass("add1")?"1차 기록 중":"이후"))} 추가한 내용</span>`));
			return;
		}
		if (el.hasClass("ref")) {
			$("body").append(dialog_base().append(`<span>${el.attr("data-for")}번 기록 언급<br></span>
				<button type="button" onclick="anchor(${el.attr("data-for")})">이동</button>`));
			return;
		}
		$("body").append(dialog_base().append(`<span>${el.attr("data-for")}번 기록<br></span>
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


export function anchor(to) {
	window.location.hash = "";
	window.location.hash = `#a${to}`;
	load_anchor();
}
window.anchor = anchor;


export async function load_week(id, code, order, button) {
	console.log(id);
	try {
		let res = await fetchget(id?`/cycelog/load?id=${id}`:(code?`/cycelog/load?code=${code}`:`/cycelog/load?order=${order}`));
		if (loaded.includes(res.data.id)) return;
		let tmp = $(`<section data-wid="${res.data.id}" data-order="${res.data.order}" id="w${res.data.id}">`);
		tmp.append($("#newweek").clone().contents());
		$("#weekname", tmp).replaceWith(`<h2>${res.data.name}</h2>`);
		$("#weekstart", tmp).replaceWith(`<time class="weekstart" datetime="${res.data.start_date}">${format_date(res.data.start_date)}</time>`);
		$("#weekend", tmp).replaceWith(`<time class="weekend" datetime="${res.data.end_date}">${format_date(res.data.end_date)}</time>`);
		$("#weekwrite", tmp).replaceWith(`<time class="weekwrite" datetime="${res.data.write_start_date}">${format_date(res.data.write_start_date)} ~ </time>`);
		$("#weekcode", tmp).replaceWith(`<data class="weekcode" value="${res.data.code}">${res.data.code}</data>`);
		for (let e of res.p) {
			$(".new", tmp).before(`<p class="p" data-pid="${e.id}">${e.content}</p>`);
		}
		deco(tmp);
		if (window.cr_onloadweek) cr_onloadweek(tmp);
		if (!$("section").length) {
			$("body").append(tmp);
			if (res.data.order === 0) {
				$(".cr_before",tmp).remove();
			}
			if (parseInt(tmp.prev().attr("data-order"))+1 === res.data.order) {
				$(".loadafter",tmp.prev()).remove();
				$(".loadbefore",tmp).remove();
			} else if (parseInt(tmp.prev().attr("data-order"))+2 === res.data.order) {
				$(".loadafter",tmp.prev()).remove();
				$(".loadbefore",tmp).addClass("loadbetween");
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
			if (res.data.order === 0) {
				$(".cr_before",tmp).remove();
			}
			if (parseInt(tmp.prev().attr("data-order"))+1 === res.data.order) {
				$(".cr_after",tmp.prev()).remove();
				$(".cr_before",tmp).remove();
			} else if (parseInt(tmp.prev().attr("data-order"))+2 === res.data.order) {
				$(".cr_after",tmp.prev()).remove();
				$(".loadbefore",tmp).addClass("loadbetween");
			}
			if (parseInt(tmp.next().attr("data-order"))-1 === res.data.order) {
				$(".cr_before",tmp.next()).remove();
				$(".cr_after",tmp).remove();
			} else if (parseInt(tmp.next().attr("data-order"))-2 === res.data.order) {
				$(".cr_before",tmp.next()).remove();
				$(".loadafter",tmp).addClass("loadbetween");
			}
		}
		$(".loadbefore",tmp).on("click", function () {
			load_week(undefined, undefined, res.data.order-1, this);
		});
		$(".loadafter",tmp).on("click", function () {
			load_week(undefined, undefined, res.data.order+1, this);
		});
		loaded.push(res.data.id);
		if (init_weeks !== -1) {
			cur_weeks++;
			if (cur_weeks === init_weeks && window.cr_onafterload) {
				for (let e of window.cr_onafterload) e();
				init_weeks = -1;
			}
		}
		return tmp;
	} catch (e) {
		console.error(e);
		$(button).addClass("loadnothing");
		$(button).off("click");
	}
	return null;
}

function format_date(d) {
	// TODO
	return d;
}

var init_weeks = 3
var cur_weeks = 0
var loaded = [];
fetchget("/cycelog/week/").then((res) => {
	res = res.slice(-init_weeks);
	for (let e of res) {
		load_week(e);
	}
});