"use strict";

// selectable text
$("a").before(" "); // hair space
$("a").prepend($(`<span class="before">#</span>`));
$("a.ref > .before").text("ref. #"); // 6-per-em space
$("a.add > .before").text("Add");
$("a.add1 > .before").text("Add1");
$("a.add3 > .before").text("Add3");
$("b.star").prepend("★").append("★");
$("q:not(.exact, .star)").prepend("'").append("'");
$("q.exact").prepend("\"").append("\"");;
$("q.star").prepend("★").append("★");;
$("span.ref.paren").prepend("(").append(" )");
$("s.namu, span.namu").append("(...)");
$("span.qm").text("?");

// dialog
$("a, data, time, span.qm").on("click", (e) => {
	e.stopPropagation();
	move_to(e.currentTarget, e.clientY);
});

$(window).on("resize", () => {
	if (!cur_el) return;
	actually_move();
});

var cur_el = null;
var cur_box = null;
function move_to(el, clicky) {
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
			cur_el = cur_box = null;
			return;
		}
		cur_box = new_box;
	}
	cur_el = el;
	create_dialog();
	actually_move();
	$("#dialog").css($(el).css(['--c','--ch','--ca','--bd','--bdh','--bda','--bg','--bgh','--bga']));
}

function actually_move() {
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
	return $(`<dialog id="dialog" open onclick="event.stopPropagation();" ontransitionend="on_trans(this);"></dialog>`);
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
				<button type="button" onclick="event.stopPropagation();">이동</button>`));
			return;
		}
		$("body").append(dialog_base().append(`<span>${el.attr("data-for")}번 기록</span>`));
		return;
	}
	if (el.hasClass("qm")) {
		$("body").append(dialog_base().append(`<span>${el.attr("data-why") ?? "진위 여부나 단어 선택의 적절성이 확실하지 않음"}</span>`));
		return;
	}
	if (el.hasClass("person")) {
		$("body").append(dialog_base().append(`<span>${el.val()} · ${"대충 이름"}<br></span>
			<button type="button" onclick="event.stopPropagation();">더 보기</button>`));
		return;
	}
	if (el.hasClass("placeholder")) {
		$("body").append(dialog_base().append(`<span>텍스트로 나타낼 수 없어 대체된 내용</span>
			${el.val() && `<br>
			<span>${el.val()}</span>`}`));
		return;
	}
	$("body").append(dialog_base().append(`<span>???</span>`));
	return;
}

$("body").on("click", (_) => {
	if (!document.getElementById("dialog")) return;
	remove_dialog(document.getElementById("dialog"));
})

function remove_dialog(e) {
	if (e.id !== "dialog") return;
	$(e).css("opacity",0).addClass("closing").removeAttr("id");
	cur_el = cur_box = null;
}

function on_trans(e) {
	if (e.classList.contains("closing")) e.remove();
}