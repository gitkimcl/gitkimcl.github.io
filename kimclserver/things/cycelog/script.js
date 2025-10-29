"use strict";

if (window.location.hash && !document.querySelector(window.location.hash)) {
	/* TODO: 서버에서 내용 가져오기 */
	console.log("업서요");
}

// selectable text
function deco(el) {
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
	$(".selected").removeClass("selected");
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

function sani(str) {
	// 실수를 막는 거지 보안용은 아님
	// 이거 개인 프로젝트임
	return str.replaceAll("&","&amp;").replaceAll("\"","&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function put(el, arr, els) {
	for (let i in arr) {
		el.append(arr[i]);
		if (els[i]) el.append(els[i].cloneNode(true));
	}
}

// edit
const s = window.getSelection();
$("#new").on("keydown", (e) => {
	/*console.log(e.originalEvent.key);
	console.log(s.anchorNode);
	console.log(s.anchorOffset);
	console.log(s.focusOffset);*/
	if (e.originalEvent.key === "Backspace" && $(".edit-inside").get(0) && $(".edit-inside").get(0).innerHTML.length === 0) {
		$(".edit-inside").off("blur");
		$(".edit-inside").get(0).blur();
		$("#new").html($("#new").html().replace("&nbsp;"," "));
		s.removeAllRanges();
		$("#new").attr("contenteditable", "true");
		s.setPosition(d$("new"),Array.prototype.indexOf.call(d$("new").childNodes,$(".edit-inside").get(0))+1);
		$(".edit-inside").remove();
		e.preventDefault();
		return;
	}
eend:if (e.originalEvent.key === "Enter" || e.originalEvent.key === "ArrowRight") {
		if (!e.originalEvent.target.classList.contains("editable")) break eend;
		if (e.originalEvent.key === "ArrowRight") {
			let n = s.anchorNode;
			if (n.nodeType === Node.TEXT_NODE) {
				if (n !== n.parentElement.lastChild || s.anchorOffset !== n.textContent.length) break eend;
			} else {
				if (s.anchorOffset !== n.childNodes.length) break eend;
			}
		}
		if (e.originalEvent.isComposing) return;
		cancel_edit_inside(true,true);
		e.preventDefault();
		return;
	}
estt:if (e.originalEvent.key === "Escape" || e.originalEvent.key === "ArrowLeft") {
		if (!e.originalEvent.target.classList.contains("editable")) break estt;
		if (e.originalEvent.key === "ArrowLeft") {
			let n = s.anchorNode;
			if (n.nodeType === Node.TEXT_NODE) {
				if (n !== n.parentElement.firstChild || s.anchorOffset !== 0) break estt;
			} else {
				if (s.anchorOffset !== 0) break estt;
			}
		}
		if (e.originalEvent.isComposing) return;
		cancel_edit_inside(true,false);
		e.preventDefault();
		return;
	}
editr:if (e.originalEvent.key === "Tab" || e.originalEvent.key === "ArrowRight") {
		if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === s.anchorNode.textContent.length) {
			let n = s.anchorNode;
			if (n.nodeType === Node.TEXT_NODE) {
				if (s.anchorOffset !== n.textContent.length) break editr;
				n = n.nextSibling;
			} else {
				if (s.anchorOffset === n.childNodes.length) break editr;
				n = n.childNodes[s.anchorOffset];
			}
			if (!n) break editr;
			if (!n.classList?.contains("editable")) break editr;
			edit_inside(n);
			s.selectAllChildren(n);
			s.collapseToStart();
			e.preventDefault();
			return;
		}
	}
editl:if (e.originalEvent.key === "Tab" || e.originalEvent.key === "ArrowLeft") {
		if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === 0) {
			let n = s.anchorNode;
			if (n.nodeType === Node.TEXT_NODE) {
				if (s.anchorOffset !== 0) break editl;
				n = n.previousSibling;
			} else {
				if (s.anchorOffset === 0) break editl;
				n = n.childNodes[s.anchorOffset-1];
			}
			if (!n) break editl;
			if (!n.classList?.contains("editable")) break editl;
			edit_inside(n);
			s.selectAllChildren(n);
			s.collapseToEnd();
			e.preventDefault();
			return;
		}
	}
cmd:if (e.originalEvent.key === "Tab") {
		if (e.originalEvent.isComposing) return;
		d$("new").normalize();
		e.preventDefault();
		if (!s.isCollapsed) {
			// TODO: 선택 어쩌고 구현
			s.collapseToEnd();
			return;
		}

		let n = s.anchorNode;
		let t = "";
		let bef = null;
		let aft = null;
		let remove = [];
		let els = [];
		if (n.nodeType === Node.TEXT_NODE) {
			t = n.textContent.slice(0,s.anchorOffset);
			aft = n.textContent.slice(s.anchorOffset);
			if (!t.includes("{")) {
				remove.push(n);
				n = n.previousSibling;
			}
		} else {
			if (s.anchorOffset === 0) {
				error();
				break cmd;
			}
			n = n.childNodes[s.anchorOffset - 1];
		}
		if (!t.includes("{")) {
			while (n) {
				if (n.nodeType === Node.TEXT_NODE) {
					t = n.textContent + t;
					if (n.textContent.includes("{")) break;
				} else {
					t = "&elem;" + t;
					els.unshift(n);
				}
				remove.push(n);
				n = n.previousSibling;
			}
		}
		if (!t.includes("{")) {
			error();
			break cmd;
		}
		bef = t.slice(0,t.length - t.match(/\{[^\{]*$/).at(0).length);
		t = t.match(/\{[^\{]*$/).at(0);
		console.log(n);
		console.log(`t = ${t}`);
		console.log(`bef = ${bef}`);
		console.log(`aft = ${aft}`);

		if (!t) {
			error();
			break cmd;
		}
		let cmd1 = k2e(t.split("/")[0]).toLowerCase().trim();
		if (cmd1.includes("&elem;")) {
			error();
			break cmd;
		}
		let cmd2 = t.split("/").slice(1);
		if (cmd2.at(-1)==="") cmd2 = cmd2.slice(0,-1);
		if (cmd2.length > 1) {
			error();
			break cmd;
		}
		cmd2 = cmd2.length?(cmd2[0].split("&elem;")):[];
		console.log(`cmd: ${cmd1} ' [${cmd2}]`);
		let ins = $(`<span class="error">오류</span>`);
		let type = -1;
cmds: 	if (cmd1.startsWith("{#")) {
			type = 1;
			// anchor
			let kind = cmd1.charAt(2);
			let id = cmd1.slice(3);
			if ("s d t g w i".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
				ins = $(`<a id="a${id}" class="${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
				put(ins, cmd2, els);
			} else type = -1;
		} else if (cmd1.startsWith("{r#")) {
			type = 1;
			// reference
			let kind = cmd1.charAt(3);
			let id = cmd1.slice(4);
			if ("s d t g w i r".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
				if (kind === 'r') {
					if (d$(`a${id}`)) {
						let cls = d$(`a${id}`).classList;
						kind = (cls.contains('s'))?'s':((cls.contains('d'))?'d':((cls.contains('t'))?'t':((cls.contains('g'))?'g':((cls.contains('w'))?'w':((cls.contains('i'))?'i':'x')))));
						if (kind != 'x') {
							ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
							put(ins, cmd2, els);
						}
						else type = -1;
					}
				} else {
					ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
					put(ins, cmd2, els);
				}
			} else type = -1;
		} else if (cmd1.startsWith("{a#")) {
			type = 1;
			// add
			if (cmd1 === "{a#") ins = $(`<a class="add"></a>`);
			else if (cmd1 === "{a#1") ins = $(`<a class="add add1"></a>`);
			else if (cmd1 === "{a#3") ins = $(`<a class="add add3"></a>`);
			else type = 0;
		} else if (cmd1 === "{?") {
			type = 0;
			ins = $(`<span class="qm"${cmd2.length?` data-why="${sani(cmd2[0])}"`:''}>`);
		} else if (cmd1.startsWith("{t")) {
			type = 1;
			let data = cmd1.slice(2);
			// TODO: 데이터 가공
			ins = $(`<time data-time="${data}">${cmd2.length?'':data}</time>`);
			put(ins, cmd2, els);
		} else if (cmd1.startsWith("{p")) {
			type = 1;
			let data = cmd1.slice(2);
			// TODO: 데이터 가공
			ins = $(`<data class="person" value="${data}">${cmd2.length?'':data}</data>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{st") {
			type = 2;
			ins = $(`<b class="star"></b>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{s") {
			type = 2;
			ins = $(`<s></s>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{b" || cmd1 === "{str") {
			type = 2;
			ins = $(`<strong></strong>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{u" || cmd1 === "{em") {
			type = 2;
			ins = $(`<em></em>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{") {
			// wrap
			type = 2;
			ins = $(`<span class="wrapper"></span>`);
			put(ins, cmd2, els);
		} else if (cmd1.startsWith("{q")) {
			type = 2;
			if (cmd1 === "{q") ins = $(`<q></q>`);
			else if (cmd1 === "{q\"") ins = $(`<q class="exact"></a>`);
			else if (cmd1 === "{qst") ins = $(`<q class="star"></a>`);
			else {
				type = -1;
				break cmds;
			}
			put(ins, cmd2, els);
		} else if (cmd1 === "{^" || cmd1 === "{sup") {
			type = 2;
			ins = $(`<sup></sup>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{_" || cmd1 === "{sub") {
			type = 2;
			ins = $(`<sub></sub>`);
			put(ins, cmd2, els);
		} else if (cmd1 === "{.." || cmd1 === "{namu") {
			type = 0;
			ins = $(`<span class="namu">`);
		} else if (cmd1.startsWith("{ec")) { // "ㄷㅊ(대체라는 뜻)"
			type = 2;
			let data = cmd1.slice(3);
			// TODO: 데이터 가공
			ins = $(`<data class="placeholder" value="${data}">${cmd2.length?'':data}</data>`);
			put(ins, cmd2, els);
		}
		if (type === -1) {
			error();
			break cmd;
		}
		n.textContent = bef;
		ins.attr("contenteditable", false);
		if (type === 1 || type === 2) ins.addClass("editable");
		$(n).after(ins);
		if (aft) {
			let after = document.createTextNode(aft);
			ins.after(after);
			if (type === 2 && !cmd2.length) edit_inside(ins.get(0));
			else s.setPosition(after,0);
		} else {
			let p = ins.get(0).parentElement;
			if (type === 2 && !cmd2.length) edit_inside(ins.get(0));
			else s.setPosition(p, Array.prototype.indexOf.call(p.childNodes,ins.get(0))+1);
		}
		for (let e of remove) e.remove();
		d$("new").normalize();
		cursor();
		return;
	}
});

function cursor() {
	console.log(s.anchorNode);
	console.log(s.anchorOffset);
	console.log(s.focusOffset);
	$(".cbefore").removeClass("cbefore");
	$(".cafter").removeClass("cafter");
	if (!s.anchorNode || !d$("new").contains(s.anchorNode)) return;
sel:{ // firefox
		let n = s.anchorNode;
		let right = 1;
		if (s.anchorNode.nodeType === Node.TEXT_NODE) {
			if (s.anchorOffset === 0) right = 0;
			n = n.parentElement;
		}
		if (n.isContentEditable) break sel;
		s.setPosition(n.parentElement,Array.prototype.indexOf.call(n.parentElement.childNodes,n)+right);
		n.parentElement.focus();
	}
bef:if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === s.anchorNode.textContent.length) {
		let n = s.anchorNode;
		if (n.nodeType === Node.TEXT_NODE) n = n.nextSibling;
		else n = n.childNodes[s.anchorOffset];
		if (!n) break bef;
		if (!n.classList?.contains("editable")) break bef;
		$(n).addClass("cbefore");
	}
aft:if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === 0) {
		let n = s.anchorNode;
		if (n.nodeType === Node.TEXT_NODE) n = n.previousSibling;
		else n = n.childNodes[s.anchorOffset-1];
		if (!n) break aft;
		if (!n.classList?.contains("editable")) break aft;
		$(n).addClass("cafter");
	}
	$("#new br").remove(); // 강제 개행 ㄴㄴ염 + <br> 때매 생기는 버그가 좀 있음
	$("#new div").remove(); // div가 왜 생김????
	$("#new *[style], #new font").each(function () { // chrome -- 복붙하면 스타일도 적용됨
		let le = this.lastChild;
		$(this).replaceWith($(this).contents());
		s.removeAllRanges();
		s.setPosition(le,(le.nodeType === Node.TEXT_NODE) ? le.textContent.length : le.childNodes.length);
	});
}
$(document).on("selectionchange", cursor);
$("#new").on("focus", cursor);
$("#new").on("blur", () => s.removeAllRanges());

function edit_inside(e) {
	$("#new").attr("contenteditable", "false");
	$(".edit-inside").off("blur");
	$(".edit-inside").attr("contenteditable", "false");
	$(".edit-inside").removeClass("edit-inside");
	$(e).attr("contenteditable", "true");
	$(e).addClass("edit-inside");
	$(e).on("blur", ()=>cancel_edit_inside(false));
	e.focus();
}

function cancel_edit_inside(parent,right) {
	$(".edit-inside").off("blur");
	$(".edit-inside").attr("contenteditable", "false");
	$(".edit-inside").get(0).blur();
	$("#new").html($("#new").html().replace("&nbsp;"," "));
	s.removeAllRanges();
	if (parent) {
		let p = $(".edit-inside").get(0).parentNode;
		s.setPosition(p,Array.prototype.indexOf.call(p.childNodes,$(".edit-inside").get(0))+(right?1:0));
		console.log(s.anchorNode);
		console.log(s.anchorOffset);
		$(".edit-inside").removeClass("edit-inside");
		if (p.id === "new") {
			$("#new").attr("contenteditable", "true");
			p.focus();
			return;
		}
		edit_inside(p);
	} else {
		$("#new").attr("contenteditable", "true");
		s.setPosition(d$("new"),Array.prototype.indexOf.call(d$("new").childNodes,$(".edit-inside").get(0))+1);
		$(".edit-inside").removeClass("edit-inside");
	}
}

$("#new").on("click", (e) => {
	if ($(".edit-inside").get(0) && !e.originalEvent.target.classList.contains("edit-inside")) cancel_edit_inside(false);
	if (e.originalEvent.target.classList.contains("editable")) {
		edit_inside(e.originalEvent.target);
	}
});

// sorry safari but I don't think I can support you

// at least safari supports this
function add() {
	let np = $("#new").clone();
	np.attr("contenteditable", null);
	$("*", np).attr("contenteditable", null);
	$("*", np).removeClass("editable").removeClass("edit-inside");
	$("*", np).removeClass("cbefore").removeClass("cafter");
	$("*[class=\"\"]", np).attr("class", null);
	$(".noclass", np).each(function () { $(this).replaceWith($(this).contents()); });
	np.attr('id', null);
	np.html($(np).html().replace("&nbsp;"," "));
	np.get(0).normalize();
	$("#new").before(np);
	deco(np);
	$("#new").empty();
}

function error() {
	$("#new").css("animation", "none");
	$("#new").offset();
	$("#new").css("animation", "error-flash 0.5s ease-out");
}