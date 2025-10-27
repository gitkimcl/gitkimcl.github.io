"use strict";

if (!document.querySelector(window.location.hash)) {
	/* TODO: 서버에서 내용 가져오기 */
	console.log("업서요");
}

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
$("span.ref.paren").prepend("(").append(" )"); // 6-per-em space
$("s.namu, span.namu").append("(...)");
$("span.qm").text("?");

const d$ = (q) => document.getElementById(q);

function deco_new() {
	$("a:not(.deco)",$("#new")).before(" "); // hair space
	$("a:not(.deco)",$("#new")).prepend($(`<span class="before">#</span>`));
	$("a:not(.deco).ref > .before",$("#new")).text("ref. #"); // 6-per-em space
	$("a:not(.deco).add > .before",$("#new")).text("Add");
	$("a:not(.deco).add1 > .before",$("#new")).text("Add1");
	$("a:not(.deco).add3 > .before",$("#new")).text("Add3");
	$("b:not(.deco).star",$("#new")).prepend("★").append("★");
	$("q:not(.deco, .exact, .star)",$("#new")).prepend("'").append("'");
	$("q:not(.deco).exact",$("#new")).prepend("\"").append("\"");;
	$("q:not(.deco).star",$("#new")).prepend("★").append("★");;
	$("span:not(.deco).ref.paren",$("#new")).prepend("(").append(" )"); // 6-per-em space
	$("s:not(.deco).namu, span:not(.deco).namu",$("#new")).append("(...)");
	$("span:not(.deco).qm",$("#new")).text("?");
	$("*",$("#new")).addClass("deco");
}

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
	d$("dialog").showPopover({'source':cur_el});
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
	$("body").append(dialog_base().append(`<span>???</span>`));
	return;
}

function remove_dialog(e) {
	if (e.id !== "dialog") return;
	$(e).css("opacity",0).addClass("closing").removeAttr("id");
	cur_el = cur_box = null;
}

function anchor(to) {
	if (d$(`a${to}`)) {
		window.location.hash = "";
		window.location.hash = `#a${to}`;
		let target = document.querySelector("*:has( > a:target)");
		console.log(target);
		target.style.animation = 'none';
		target.offsetHeight;
		target.style.animation = "bg-flash 0.5s ease-out";
		remove_dialog(d$("dialog"));
		return;
	}
	/* TODO: 서버에서 내용 가져오기 */
	console.log("업서요");
}

// edit
$("#new").on("keydown", (e) => {
	if (e.originalEvent.key !== "Tab") return;
	d$("new").normalize();
	e.preventDefault();
	let s = window.getSelection();
	s.collapseToEnd();
	let idx = s.anchorOffset;
	let t = s.anchorNode.textContent;
	let cmd = t.slice(0,idx).match(/ ?\{[^\{]*$/)?.at(0)?.toLowerCase()?.trim();
	if (!cmd) return;
	let cmd1 = k2e(cmd.split("/")[0]);
	let cmd2 = cmd.split("/").slice(1).join("/");
	if (cmd2.at(-1)==="/") cmd2 = cmd2.slice(0,-1);
	console.log(`cmd: ${cmd1} / ${cmd2}`);
	let del = t.slice(0,idx).replace(/ ?\{[^\{]*$/,"");
	let ins = $(`<span class="error">오류</span>`);
	if (cmd1.startsWith("{#")) {
		// anchor
		let kind = cmd1.charAt(2);
		let id = cmd1.slice(3);
		if ("s d t g w i".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
			ins = $(`<a id="a${id}" class="${kind}" data-for="${id}">${id}${cmd2&&' ' + cmd2}</a>`);
		}
	} else if (cmd1.startsWith("{r#")) {
		// reference
		let kind = cmd1.charAt(3);
		let id = cmd1.slice(4);
		if ("s d t g w i r".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
			if (kind === 'r') {
				if (d$(`a${id}`)) {
					let cls = d$(`a${id}`).classList;
					kind = (cls.contains('s'))?'s':((cls.contains('d'))?'d':((cls.contains('t'))?'t':((cls.contains('g'))?'g':((cls.contains('w'))?'w':((cls.contains('i'))?'i':'x')))));
					if (kind != 'x') ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2&&' ' + cmd2}</a>`);
				}
			} else {
				ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2&&' ' + cmd2}</a>`);
			}
		}
	} else if (cmd1.startsWith("{a#")) {
		// add
		if (cmd1 === "{a#") ins = $(`<a class="add"></a>`);
		else if (cmd1 === "{a#1") ins = $(`<a class="add add1"></a>`);
		else if (cmd1 === "{a#3") ins = $(`<a class="add add3"></a>`);
	}
	s.anchorNode.textContent = del;
	ins.attr("contenteditable", false);
	$(s.anchorNode).after(ins);
	let after = document.createTextNode(t.slice(idx));
	ins.after(after);
	s.selectAllChildren(after);
	s.collapseToStart
	s.collapseToEnd();
	deco_new();
	d$("new").normalize();
});