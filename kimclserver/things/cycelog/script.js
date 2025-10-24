"use strict";
$("time").attr("title", function () { return $(this).attr("data-title") ?? $(this).attr("data-time") ?? $(this).text(); });
$("data").attr("title", function () { return $(this).attr("data-title") ?? $(this).attr("value") ?? $(this).text(); });
$("span.qm").attr("title", function () { return $(this).attr("data-why") ?? "진위 여부나 단어 선택의 적절성이 확실하지 않음"; });

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

var cur_el = null;
var cur_box = null;
function move_to(el, clicky) {
	$("#dialog").css("opacity",0).addClass("closing").removeAttr("id");
	let rects = el.getClientRects();
	let rect = rects[cur_box ?? 0];
	if (clicky != null) {
		let new_box = null;
		for (let i in rects) {
			let e = rects[i];
			if (e.top <= clicky && clicky <= e.bottom) {
				new_box = i;
				rect = rects[i];
				break;
			}
		}
		if (cur_el === el && cur_box === new_box) {
			$("#dialog").css("opacity",0).addClass("closing").removeAttr("id");
			cur_el = null;
			cur_box = null;
			return;
		}
		cur_box = new_box;
	}
	cur_el = el;
	let x = window.scrollX + rect.x + rect.width/2;
	let y = window.scrollY + rect.bottom + 4;
	create_dialog(el);
	actually_move(x, y);
	$("#dialog").css({
		'--c': $(el).css('--c'),
		'--ch': $(el).css('--ch'),
		'--ca': $(el).css('--ca'),
		'--bd': $(el).css('--bd'),
		'--bdh': $(el).css('--bdh'),
		'--bda': $(el).css('--bda'),
		'--bg': $(el).css('--bg'),
		'--bgh': $(el).css('--bgh'),
		'--bga': $(el).css('--bga')
	});
}

function actually_move(x, y) {
	let vx = window.innerWidth;
	let dw = $("#dialog").innerWidth();
	if (x < dw/2) x = dw/2 + 12;
	if (x > vx-dw/2) x = vx-dw/2 - 12;
	console.log(`${x}`);
	$("#dialog").css("left", `${x}px`).css("top",`${y}px`);
}

function create_dialog(e) {
	let el = $(e);
	if (e.tagName === 'A') {
		if (el.hasClass("add")) {
			$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
				수첩 기록 시엔 없었으나<br>
				${(el.hasClass("add3")?"3차 기록 중":(el.hasClass("add1")?"1차 기록 중":"이후"))} 추가한 내용
			</dialog>`));
			return;
		}
		if (el.hasClass("ref")) {
			$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
				${el.attr("data-for")}번 기록 언급<br>
				<button type="button">이동</button><button command="close" commandfor="dialog" type="button">닫기</button>
			</dialog>`));
			return;
		}
		$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
			${el.attr("data-for")}번 기록
		</dialog>`));
		return;
	}
	if (el.hasClass("qm")) {
		$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
			${el.attr("data-why") ?? "진위 여부나 단어 선택의 적절성이 확실하지 않음"}
		</dialog>`));
		return;
	}
	if (el.hasClass("person")) {
		$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
			${el.val()} · ${"대충 이름"}<br>
			<button type="button">더 보기</button><button command="close" commandfor="dialog" type="button">닫기</button>
		</dialog>`));
		return;
	}
	$("body").append($(`<dialog id="dialog" open closedby="any" onclose="remove_dialog(this);" ontransitionend="on_trans(this);">
		???
	</dialog>`));
	return;
}

function remove_dialog(e) {
	if (e.id !== "dialog") return;
	$(e).css("opacity",0).addClass("closing").removeAttr("id");
	cur_el = null;
	cur_box = null;
}

function on_trans(e) {
	let el = $(e);
	if (el.hasClass("closing")) el.remove();
}

$("a, data, time, span.qm").on("click", (e) => {
	move_to(e.currentTarget, e.clientY);
});

$(window).on("resize", () => {
	if (!cur_el) return;
	let rects = cur_el.getClientRects();
	let rect = rects[cur_box ?? 0];
	let x = window.scrollX + rect.x + rect.width/2;
	let y = window.scrollY + rect.bottom + 4;
	actually_move(x, y);
});