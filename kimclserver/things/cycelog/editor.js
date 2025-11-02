import { k2e } from './k2e.js'
import { fetchget, fetchbody } from '../../global/util.js';
import { deco, load_week } from './script.js'

const d$ = (q) => document.getElementById(q);

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
function input(e) {
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
	if (e.originalEvent.key === "Backspace" && $(".cafter").length) {
		let last = $(".cafter").get(0).lastChild;
		$(".cafter").replaceWith($(".cafter").contents());
		s.setPosition(d$("new"),Array.prototype.indexOf.call(d$("new").childNodes,last)+1);
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
					t = "\0" + t;
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
		if (!t) {
			error();
			break cmd;
		}
		let cmd1 = k2e(t.split("/")[0]).toLowerCase().trim();
		if (cmd1.includes("\0")) {
			error();
			break cmd;
		}
		let cmd2 = t.split("/").slice(1);
		if (cmd2.at(-1)==="") cmd2 = cmd2.slice(0,-1);
		cmd2 = cmd2.map((e)=>e.split("\0"));
		console.log(`cmd: ${cmd1} / [${cmd2}]`);
		let ins = $(`<span class="error block">오류</span>`);
		let type = -1;
cmds: 	if (cmd1.startsWith("{#")) {
			if (cmd2.length > 1) break cmds;
			type = 1;
			// anchor
			let kind = cmd1.charAt(2);
			let id = parseInt(cmd1.slice(3));
			if ("s d t g w i".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
				ins = $(`<a id="a${id}" class="${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
				put(ins, cmd2[0], els);
			} else type = -1;
		} else if (cmd1.startsWith("{r#")) {
			if (cmd2.length > 1) break cmds;
			type = 1;
			// reference
			let kind = cmd1.charAt(3);
			let id = cmd1.slice(4);
			if ("s d t g w i r".split(' ').indexOf(kind) !== -1 && parseInt(id) == id) {
				if (kind === 'r') {
					if (d$(`a${id}`)) {
						let cls = d$(`a${id}`).classList;
						kind = get_kind(cls);
						if (kind != 'x') {
							ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
							put(ins, cmd2[0], els);
							break cmds;
						}
					}
					if ($("#type_pending").length) {
						type = -1;
						break cmds;
					}
					ins = $(`<a id="type_pending" class="ref block" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
					fetchget(`/cycelog/find/a?id=${id}`).then((res) => {
						$("#type_pending").addClass(res.type).removeClass("block").attr("id",null);
					}).catch(() => {
						$("#type_pending").replaceWith($(`<span class="error block">오류</span>`));
					})
					put(ins, cmd2[0], els);
					break cmds;
				} else {
					ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
					put(ins, cmd2[0], els);
				}
			} else type = -1;
		} else if (cmd1.startsWith("{a#")) {
			if (cmd2.length > 0) break cmds;
			type = 1;
			// add
			if (cmd1 === "{a#") ins = $(`<a class="add"></a>`);
			else if (cmd1 === "{a#1") ins = $(`<a class="add add1"></a>`);
			else if (cmd1 === "{a#3") ins = $(`<a class="add add3"></a>`);
			else type = 0;
		} else if (cmd1 === "{?") {
			if (cmd2.length > 1) break cmds;
			if (cmd2[0]?.length>1) break cmds;
			type = 0;
			ins = $(`<span class="qm"${cmd2.length?` data-why="${sani(cmd2[0][0])}"`:''}>`);
		} else if (cmd1.startsWith("{t")) {
			if (cmd2.length > 1) break cmds;
			let data = cmd1.slice(2);
			let anchor = null;
			if (data.includes("#")) {
				anchor = data.split("#")[1];
				data = data.split("#")[0];
			}
			if (!/^\d{6}(.\d\d)?$|^0*\d{2}(.\d\d)?$/.test(data)) break cmds;
			if ($(`time[data-anchor="${anchor}"]`,$("#new")).length) break cmds;
			type = 1;
			if (anchor === null) ins = $(`<time data-time="${data}">${cmd2.length?'':data}</time>`);
			else ins = $(`<time data-time="${data}" data-anchor="${anchor}">${cmd2.length?'':data}</time>`);
			put(ins, cmd2[0], els);
		} else if (cmd1.startsWith("{p")) {
			if (cmd2.length > 2) break cmds;
			if (cmd2[0]?.length>1 || cmd2[1]?.length>1) break cmds;
			type = 1;
			let data = cmd1.slice(2);
			if (cmd2.length === 0) ins = $(`<data class="person" value="${data}">${data}</data>`);
			else if (cmd2.length === 1) ins = $(`<data class="person" value="${data}">${cmd2[0][0]}</data>`);
			else ins = $(`<data class="person" value="${data}" data-name="${cmd2[1][0]}">${cmd2[0][0]}</data>`);
		} else if (cmd1 === "{st") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<b class="star"></b>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{s") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<s></s>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{b" || cmd1 === "{str") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<strong></strong>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{u" || cmd1 === "{em") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<em></em>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{") {
			if (cmd2.length > 1) break cmds;
			// wrap
			type = 2;
			ins = $(`<span class="wrapper"></span>`);
			put(ins, cmd2, els);
		} else if (cmd1.startsWith("{q")) {
			if (cmd2.length > 1) break cmds;
			type = 2;
			if (cmd1 === "{q") ins = $(`<q></q>`);
			else if (cmd1 === "{q\"") ins = $(`<q class="exact"></a>`);
			else if (cmd1 === "{qst") ins = $(`<q class="star"></a>`);
			else {
				type = -1;
				break cmds;
			}
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{^" || cmd1 === "{sup") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<sup></sup>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{_" || cmd1 === "{sub") {
			if (cmd2.length > 1) break cmds;
			type = 2;
			ins = $(`<sub></sub>`);
			put(ins, cmd2[0], els);
		} else if (cmd1 === "{.." || cmd1 === "{namu") {
			if (cmd2.length > 1) break cmds;
			type = 0;
			ins = $(`<span class="namu">`);
		} else if (cmd1.startsWith("{ec")) { // "ㄷㅊ(대체라는 뜻)"
			if (cmd2.length > 1) break cmds;
			type = 2;
			let data = cmd1.slice(3);
			// TODO: 데이터 가공
			ins = $(`<data class="placeholder" value="${data}">${cmd2.length?'':data}</data>`);
			put(ins, cmd2[0], els);
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
}

function get_kind(cls) {
	return (cls.contains('s'))?'s':((cls.contains('d'))?'d':((cls.contains('t'))?'t':((cls.contains('g'))?'g':((cls.contains('w'))?'w':((cls.contains('i'))?'i':'x')))));
}

function cursor() {
	/*console.log(s.anchorNode);
	console.log(s.anchorOffset);
	console.log(s.focusOffset);*/
	$(".cbefore").removeClass("cbefore");
	$(".cafter").removeClass("cafter");
	if (!d$("new")) return;
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
export function add() {
	if ($("#new .block").length) {
		error();
		return;
	}
	let np = $("#new").clone();
	np.attr("contenteditable", null);
	$("*", np).attr("contenteditable", null);
	$("*", np).removeClass("editable").removeClass("edit-inside");
	$("*", np).removeClass("cbefore").removeClass("cafter");
	$(".deletep", np).remove();
	$("*[class=\"\"]", np).attr("class", null);
	$(".noclass", np).each(function () { $(this).replaceWith($(this).contents()); });
	np.attr('id', null).attr("class", "p");
	np.html($(np).html().replace("&nbsp;"," "));
	np.get(0).normalize();
	let p = $("#new").parent();
	let body = {
		head_of_id: ($(".p",p).length)?null:p.attr("data-wid"),
		parent_id: p.attr("data-wid"),
		before_id: ($(".p",p).length)?$(".p",p).last().attr("data-pid"):null,
		anchors: $("a:not(.ref, .add)",np).get().map((e,i) => {
			let time = null;
			let te = $(`time[data-anchor="${i+1}"]`,np).first();
			if (te.length) {
				let tv = te.attr("data-time");
				if (tv.startsWith("0*")) time = {
					week: 0,
					day: -3,
					hour: parseInt(tv.slice(2,4)),
					end_hour: (tv.length>4)?tv.slice(5,7):null,
					datetime: "test"
				};
				else time = {
					week: parseInt(tv.slice(0,3)),
					day: parseInt(tv.slice(3,4)),
					hour: parseInt(tv.slice(4,6)),
					end_hour: (tv.length>6)?tv.slice(7,9):null,
					datetime: "test"
				}
			}
			return {id: parseInt(e.attributes['data-for'].value), type: get_kind(e.classList), time: time}
		}),
		refs: $("a.ref",np).get().map((e) => {
			return {ref_id: parseInt(e.attributes['data-for'].value)}
		}),
		people: $("data.person",np).get().map((e) => {
			return {code: e.attributes['value'].value, name: e.attributes['data-name']?.value}
		}),
		content: (!/^-+$/.test(np.get(0).innerHTML))?np.get(0).innerHTML:"<hr>"
	};
	console.log(body);
	fetchbody("/cycelog/p","POST",body).then((e) => {
		console.log(e);
		let np = $(`<p class="p" data-pid="${e.id}">${e.content}</p>`);
		if (e === "<hr>") np = $(`<hr class="p" data-pid="${e.id}">`);
		np.prepend($(`<button class="delete deletep"><svg><use href="#trash"></use></svg></button>`).on("click", () => delete_p(e.id)));
		deco(np);
		$(".new", p).before(np);
		$("#new").text("내용 입력...");
	}).catch((res) => {
		alert(`문단 추가 실패: ${res}`);
	});
}
window.add = add;

export function startnew(el) {
	stopnew();
	$(".new", $(el.parentElement.parentElement)).attr("id","new");
	$("#new").attr("contenteditable", "true");
	$("#new").on("keydown", input);
}
window.startnew = startnew;

export function stopnew() {
	$("#new").text("내용 입력...");
	$("#new").attr("contenteditable", "false");
	$("#new").off("keydown");
	$("#new").attr("id", null);
}
window.stopnew = stopnew;

function error() {
	$("#new").css("animation", "none");
	$("#new").offset();
	$("#new").css("animation", "error-flash 0.5s ease-out");
}

function delete_p(id) {
	if (!confirm("이 문단을 삭제하겠습니까?")) return;
	fetchbody("/cycelog/p", "DELETE", {
		id: id
	}).then((res) => {
		console.log(res);
		$(`.p[data-pid=${id}]`).remove();
	})
}

function delete_week(id) {
	if (!confirm("이 주차를 삭제하겠습니까?")) return;
	fetchbody("/cycelog/week", "DELETE", {
		id: id
	}).then((res) => {
		console.log(res);
		let prev = $(`section[data-wid=${id}]`).prev();
		let next = $(`section[data-wid=${id}]`).next();
		$(".cr_after",prev).removeClass("hidden");
		$(".cr_before",next).removeClass("hidden");
		$(".cr_loadnothing",prev).removeClass("cr_loadnothing");
		$(".cr_loadnothing",next).removeClass("cr_loadnothing");
		if (parseInt(next.attr("data-order")) - parseInt(prev.attr("data-order")) === 2) {
			$(".loadafter",prev).addClass("loadbetween");
			$(".cr_before",next).addClass("hidden");
		}
		$(`section[data-wid=${id}]`).remove();
	})
}

function cr_onloadweek(el) {
	$("h2", el).prepend($(`<button class="delete deleteweek"><svg><use href="#trash"></use></svg></button>`).on("click", () => delete_week(parseInt(el.attr("data-wid")))));
	$(".p", el).prepend(function () {
		let id = $(this).attr("data-pid");
		return $(`<button class="delete deletep"><svg><use href="#trash"></use></svg></button>`).on("click", () => delete_p(id));
	});
	let ord = parseInt(el.attr("data-order"));
	$(".makebefore", el).on("click", function() { makeweek(ord-1); });
	$(".makeafter", el).on("click", function() { makeweek(ord+1); });
	$(".to-top", el).on("click", function() { window.location.hash = ''; window.location.hash=`#w${el.attr("data-wid")}`; for (let e of window.cr_onafterload) e(); });
}
window.cr_onloadweek = cr_onloadweek;

function makeweek(order) {
	if (!confirm("주차를 만듭시다")) return;
	let name = prompt("주 이름을 입력하세요");
	if (name==null) return;
	let code = prompt("주 번호를 입력하세요");
	if (code==null) return;
	code = parseInt(code);
	let start_date = prompt("시작일이 언제인가요? YYYY-MM-DD 형식으로 입력하세요");
	if (start_date==null) return;
	let end_date = prompt("종료일이 언제인가요? YYYY-MM-DD 형식으로 입력하세요");
	if (end_date==null) return;
	let write_start_date = prompt("기록 시작 일시가 언제인가요? YYYY-MM-DDTHH:MM 형식으로 입력하거나 비워 두세요(T 대신 ㅆ을 써도 됩니다)");
	if (write_start_date==null) return;
	write_start_date = write_start_date.replace("ㅆ","T");
	fetchbody("/cycelog/week", "POST", {
		name: name,
		code: code,
		order: order,
		start_date: start_date,
		end_date: end_date,
		write_start_date: (write_start_date!='')?write_start_date:null
	}).then((res) => {
		load_week(res.data.id)
	}).catch((res) => {
		alert(`주차 생성 실패: ${res}`);
	});
}

function init_make_button(w) {
	if (w === 0) {
		let nel = $(`<section data-order="-1"><div class="cr_buttons cr_after"><button class="cr_button makeafter" style="display:unset;"></button></div></section>`);
		$(".makeafter", nel).on("click", function() { makeweek(0); nel.remove(); });
		$("body").append(nel);
	}
}
window.cr_onafterload.push(init_make_button);