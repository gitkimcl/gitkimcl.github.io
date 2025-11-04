import { k2e } from './k2e.js'
import { fetchget, fetchbody } from '../../global/util.js';
import { deco, load_week, reload_week, attach_dialog, sani, get_p } from './script.js'

const d$ = (q) => document.getElementById(q);

function get_kind(cls) {
	return (cls.contains('s'))?'s':((cls.contains('d'))?'d':((cls.contains('t'))?'t':((cls.contains('g'))?'g':((cls.contains('w'))?'w':((cls.contains('i'))?'i':'x')))));
}

function move_cursor_to(e, o) {
	if (e instanceof $) e = e.get(0);
	let p = e.parentNode;
	s.setPosition(p,Array.prototype.indexOf.call(p.childNodes,e)+o);
}

function put(el, arr, els) {
	for (let i in arr) {
		el.append(arr[i]);
		if (els[i]) el.append(els[i].cloneNode(true));
	}
}

function error() {
	$("#new").css("animation", "none");
	$("#new").offset();
	$("#new").css("animation", "error-flash 0.5s ease-out");
}

// edit
const s = window.getSelection();
function input(e) {
	/*console.log(e.originalEvent.key);
	console.log(s.anchorNode);
	console.log(s.anchorOffset);
	console.log(s.focusOffset);*/
	if (e.originalEvent.key === "Escape") {
		if (cancel_new()) e.preventDefault();
	}
	if (e.originalEvent.key === "Enter") {
		if (confirm("문단을 추가하시겠습니까?")) {
			add_p();
			e.preventDefault();
		}
	}
	if (e.originalEvent.key === "Backspace" && $(".edit-inside").get(0) && $(".edit-inside").get(0).innerHTML.length === 0) {
		$(".edit-inside").off("blur");
		$(".edit-inside").get(0).blur();
		$("#new").html($("#new").html().replace("&nbsp;"," "));
		s.removeAllRanges();
		$("#new").attr("contenteditable", "true");
		move_cursor_to($(".edit-inside"),1);
		$(".edit-inside").remove();
		e.preventDefault();
		return;
	}
	if (e.originalEvent.key === "Backspace" && $(".cafter").length) {
		let last = $(".cafter").get(0).lastChild;
		$(".cafter").replaceWith($(".cafter").contents());
		move_cursor_to(last,1);
		e.preventDefault();
		return;
	}
eend:if (e.originalEvent.key === "ArrowRight") {
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
estt:if (e.originalEvent.key === "ArrowLeft") {
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
editr:if (e.originalEvent.key === "ArrowRight") {
		if (s.anchorNode.nodeType === Node.TEXT_NODE && s.anchorOffset !== s.anchorNode.textContent.length) break editr;
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
editl:if (e.originalEvent.key === "ArrowLeft") {
		if (s.anchorNode.nodeType === Node.TEXT_NODE && s.anchorOffset !== 0) break editl;
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
		let bef = null, aft = null;
		let cmd1 = null, cmd2 = null;
		let remove = [];
		let type = -1, ins = null;
		try {
			let t = "";
			let els = [];
			let put_as = undefined;
gett:		{
				if (n.nodeType === Node.TEXT_NODE) {
					t = n.textContent.slice(0,s.anchorOffset);
					aft = n.textContent.slice(s.anchorOffset);
					if (t.includes("{")) break gett;
					remove.push(n);
					n = n.previousSibling;
				} else {
					if (s.anchorOffset === 0) throw -1;
					n = n.childNodes[s.anchorOffset - 1];
				}
				while (n) {
					if (n.nodeType === Node.TEXT_NODE) {
						t = n.textContent + t;
						if (n.textContent.includes("{")) break;
					} else {
						t = "\uFFFC" + t;
						els.unshift(n);
					}
					remove.push(n);
					n = n.previousSibling;
				}
				if (!t.includes("{")) throw -1;
			}
			bef = t.slice(0,t.length - t.match(/\{[^\{]*$/).at(0).length);
			t = t.match(/\{[^\{]*$/).at(0);
			if (!t) throw -1;

			cmd1 = k2e(t.split("/")[0]).toLowerCase().trim();
			if (cmd1.includes("\uFFFC")) throw -1;
			cmd2 = t.split("/").slice(1);
			if (cmd2.at(-1)==="") cmd2 = cmd2.slice(0,-1);
			cmd2 = cmd2.map((e)=>e.split("\uFFFC"));
			console.log(cmd2);
			console.log(`cmd: ${cmd1} / [${cmd2}]`);

		 	if (cmd1.startsWith("{#")) [type, ins, put_as] = cmd_entry(cmd1, cmd2);
			else if (cmd1.startsWith("{r#")) [type, ins, put_as] = cmd_ref(cmd1, cmd2);
			else if (cmd1.startsWith("{a#")) [type, ins, put_as] = cmd_add(cmd1, cmd2)
			else if (cmd1.startsWith("{t")) [type, ins, put_as] = cmd_time(cmd1, cmd2);
			else if (cmd1.startsWith("{p") || cmd1.startsWith("{@")) [type, ins, put_as] = cmd_person(cmd1, cmd2);
			else if (cmd1 === "{?") [type, ins, put_as] = cmd_qm(cmd2);
			else if (cmd1 === "{st") [type, ins, put_as] = cmd_format(cmd2, `<b class="star">`);
			else if (cmd1 === "{s") [type, ins, put_as] = cmd_format(cmd2, `<s>`);
			else if (cmd1 === "{b" || cmd1 === "{str") [type, ins, put_as] = cmd_format(cmd2, `<strong>`);
			else if (cmd1 === "{u" || cmd1 === "{em") [type, ins, put_as] = cmd_format(cmd2, `<em>`);
			else if (cmd1 === "{q") [type, ins, put_as] = cmd_format(cmd2, `<q>`);
			else if (cmd1 === "{q\"") [type, ins, put_as] = cmd_format(cmd2, `<q class="exact">`);
			else if (cmd1 === "{qst") [type, ins, put_as] = cmd_format(cmd2, `<q class="star">`);
			else if (cmd1 === "{^" || cmd1 === "{sup") [type, ins, put_as] = cmd_format(cmd2, `<sup>`);
			else if (cmd1 === "{_" || cmd1 === "{sub") [type, ins, put_as] = cmd_format(cmd2, `<sub>`);
			else if (cmd1 === "{ins") [type, ins, put_as] = cmd_format(cmd2, `<ins>`);
			else if (cmd1 === "{del") [type, ins, put_as] = cmd_format(cmd2, `<del>`);
			else if (cmd1 === "{end") [type, ins, put_as] = cmd_format(cmd2, `<span class="weekend">`);
			else if (cmd1 === "{") [type, ins, put_as] = cmd_wrapper(cmd2);
			else if (cmd1 === "{.." || cmd1 === "{namu") [type, ins, put_as] = cmd_namu(cmd2);
			else if (cmd1.startsWith("{ec")) [type, ins, put_as] = cmd_placeholder(cmd1, cmd2); // ㄷㅊ(대체라는 뜻)
			else if (cmd1 === "{fig") [type, ins, put_as] = cmd_fig(bef, aft, cmd2, els);
			else throw "없는 명령";
			if (type === -1 || ins == null) throw "알 수 없는 오류 발생";
			if (put_as != undefined) put(ins, put_as, els);
		} catch (e) {
			console.log(e);
			error();
			break cmd;
		}
		n.textContent = bef;
		ins.attr("contenteditable", false);
		if (type & 1) ins.on("click", (e) => {
			attach_dialog(e.currentTarget, e.clientY);
			e.stopPropagation();
		});
		if (type & 2) ins.addClass("editable");
		$(n).after(ins);
		if (aft) {
			let after = document.createTextNode(aft);
			ins.after(after);
			if ((type & 4) && !cmd2.length) edit_inside(ins.get(0));
			else s.setPosition(after,0);
		} else {
			if ((type & 4) && !cmd2.length) edit_inside(ins.get(0));
			else move_cursor_to(ins,1);
		}
		for (let e of remove) e.remove();
		d$("new").normalize();
		cursor();
		return;
	}
}

function cursor() {
	/*console.log(s.anchorNode);
	console.log(s.anchorOffset);
	console.log(s.focusOffset);*/
	$(".cbefore").removeClass("cbefore");
	$(".cafter").removeClass("cafter");
	if (!d$("new") || d$("new").classList.contains("newhtml")) return;
	if (!s.anchorNode || !d$("new").contains(s.anchorNode)) return;
sel:{ // firefox
		let n = s.anchorNode;
		let right = 1;
		if (s.anchorNode.nodeType === Node.TEXT_NODE) {
			if (s.anchorOffset === 0) right = 0;
			n = n.parentElement;
		}
		if (n.isContentEditable) break sel;
		move_cursor_to(n,right);
		n.parentElement.focus();
	}
bef:if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === s.anchorNode.textContent.length) {
		let n = s.anchorNode;
		if (n.nodeType === Node.TEXT_NODE) n = n.nextSibling;
		else n = n.childNodes[s.anchorOffset];
		if (!n || !n.classList?.contains("editable")) break bef;
		$(n).addClass("cbefore");
	}
aft:if (s.anchorNode.nodeType !== Node.TEXT_NODE || s.anchorOffset === 0) {
		let n = s.anchorNode;
		if (n.nodeType === Node.TEXT_NODE) n = n.previousSibling;
		else n = n.childNodes[s.anchorOffset-1];
		if (!n || !n.classList?.contains("editable")) break aft;
		$(n).addClass("cafter");
	}
	$("#new br").remove(); // 강제 개행 ㄴㄴ염 + <br> 때매 생기는 버그가 좀 있음
	$("#new div:not(.cr_icons)").remove(); // div가 왜 생김????
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
	$("#new").html($("#new").html().replace("&nbsp;"," ").replace("\uFFFC"," "));
	s.removeAllRanges();
	if (!parent) {
		$("#new").attr("contenteditable", "true");
		move_cursor_to($(".edit-inside"),1);
		$(".edit-inside").removeClass("edit-inside");
		return;
	}
	let p = $(".edit-inside").get(0).parentNode;
	move_cursor_to($(".edit-inside"),(right?1:0));
	$(".edit-inside").removeClass("edit-inside");
	if (p.id === "new") {
		$("#new").attr("contenteditable", "true");
		p.focus();
		return;
	}
	edit_inside(p);
}

function cmd_entry(cmd1, cmd2) {
	if (cmd2.length > 1) throw "항목 - 인자가 너무 많음";
	// entry
	let kind = cmd1.charAt(2);
	let id = parseInt(cmd1.slice(3));
	if ("s d t g w i".split(' ').indexOf(kind) !== -1) {
		let ins = $(`<a id="a${id}" class="${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
		return [3,ins,cmd2[0]];
	}
	throw "항목 - 종류가 올바르지 않음";
}
function cmd_ref(cmd1, cmd2) {
	if (cmd2.length > 1) throw "언급 - 인자가 너무 많음";
	// reference
	let id = cmd1.slice(3);
	if (d$(`a${id}`)) {
		let cls = d$(`a${id}`).classList;
		let kind = get_kind(cls);
		if (kind != 'x') {
			let ins = $(`<a class="ref ${kind}" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
			return [3,ins,cmd2[0]];
		}
	}
	if ($("#type_pending").length) throw "언급 - 충돌 방지(재시도하면 됨)";
	let ins = $(`<a id="type_pending" class="ref block" data-for="${id}">${id}${cmd2.length?' ':''}</a>`);
	fetchget(`/cycelog/find/a?id=${id}`).then((res) => {
		$("#type_pending").addClass(res.type).removeClass("block").attr("id",null);
	}).catch(() => {
		$("#type_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
	});
	return [3,ins,cmd2[0]];
}
function cmd_add(cmd1, cmd2) {
	if (cmd2.length > 0) throw "추가 - 인자가 너무 많음";
	let ins = null
	if (cmd1 === "{a#") ins = $(`<a class="add"></a>`);
	else if (cmd1 === "{a#1") ins = $(`<a class="add add1"></a>`);
	else if (cmd1 === "{a#3") ins = $(`<a class="add add3"></a>`);
	else throw "추가 - 올바르지 않은 명령";
	return [1,ins];
}
var zero_star = new Date(2025, 1, 6);
var zero_zero = new Date(2025, 1, 9);
function cmd_time(cmd1, cmd2) {
	if (cmd2.length > 1) throw "시간 - 인자가 너무 많음";
	let data = cmd1.slice(2);
	let entry = null;
	if (data.includes("#")) {
		entry = data.split("#")[1];
		data = data.split("#")[0];
		if ($(`time[data-entry="${entry}"]`,$("#new")).length) throw "시간 - 이미 시간 정보가 추가된 항목임";
	}
	let ins = null;
	if (data.length === 2) {
		if (cmd2.length === 0 || cmd2[0]?.length>1) throw "시간(추정) - 올바르지 않은 인자(첫 번째 인자는 생략할 수 없으며 텍스트로만 구성돼야 함)";
		let detected = cmd2[0][0].match(/^(\d+)월 (\d+)일(?: (\d+)시(?:(?:경?(?:에서|부터) (\d+)시경$)|경$)|$)/);
		if (detected == null) throw "시간(추정) - 추정 실패, /^(\d+)월 (\d+)일(?: (\d+)시(?:(?:경?(?:에서|부터) (\d+)시경$)|경$)|$)/ 꼴로 입력";
		let week = $("#new").parent();
		let year = 2000 + parseInt(data); // TODO: 2100년에 여기 업데이트하기
		let date = new Date(year, detected[1]-1, detected[2]);
		let order = null, day = null;
		if (date - zero_star === 0) {
			order = -1;
			day = 0;
		} else {
			let diff = Math.round((date - zero_zero)/86400000);
			order = Math.floor(diff/7);
			day = ((diff%7)+7)%7;
			if ((order === -1 || order === parseInt(week.attr("data-order"))-1) && day>=5) {
				order += 1;
				day += 3; // -7 +10
			}
			if (order === parseInt(week.attr("data-order"))+1 && day === 0) {
				order -= 1;
				day = 7;
			}
		}
		if ($("#timestamp_pending").length || $("#datetime_pending").length) throw "시간 - 충돌 방지(재시도하면 됨)";
		if (entry === null) ins = $(`<time id="timestamp_pending" class="block">${cmd2[0][0]}</time>`);
		else ins = $(`<time id="timestamp_pending" class="block" data-entry="${entry}">${cmd2[0][0]}</time>`);
		fetchget(`/cycelog/find/timestamp?order=${order}&day=${day}${detected[3]?`&hour=${detected[3]}`:''}${detected[4]?`&end_hour=${detected[4]}`:''}`).then((res) => {
			$("#timestamp_pending").attr("data-time",res).attr("id","datetime_pending");
			fetchget(`/cycelog/find/datetime?timestamp=${res}`).then((res) => {
				$("#datetime_pending").attr("datetime",res).removeClass("block").attr("id",null);
			}).catch(() => {
				$("#datetime_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
			});
		}).catch(() => {
			$("#timestamp_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
		});
		return [3,ins];
	} else {
		if (!/^\d{4}(\d\d(\.\d\d)?)?$|^0\*(\d\d(\.\d\d)?)?$/.test(data)) throw "시간 - 타임스탬프 형식이 올바르지 않음";
		if (entry === null) ins = $(`<time id="datetime_pending" class="block" data-time="${data}">${cmd2.length?'':data}</time>`);
		else ins = $(`<time id="datetime_pending" class="block" data-time="${data}" data-entry="${entry}">${cmd2.length?'':data}</time>`);
		fetchget(`/cycelog/find/datetime?timestamp=${data}`).then((res) => {
			$("#datetime_pending").attr("datetime",res).removeClass("block").attr("id",null);
		}).catch(() => {
			$("#datetime_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
		});
		return [3,ins,cmd2[0]];
	}
}
function cmd_person(cmd1, cmd2) {
	if (cmd2.length > 2) throw "인물 - 인자가 너무 많음";
	let data = cmd1.slice(2);
	if (data.endsWith("=")) {
		// canon
		data = data.slice(0, -1);
		if (cmd2.length === 0 || cmd2[0]?.length>1) throw "인물(등록) - 올바르지 않은 인자(첫 번째 인자는 생략할 수 없으며 텍스트로만 구성돼야 함)";
		if ($(`data.person[data-type="canon"][value="${data}"]`,$("#new")).length) throw "인물(등록) - 같은 문단에서 이미 등록된 인물";
		let ins = $(`<data class="person" data-type="canon" value="${data}" data-name="${cmd2[0][0]}">${cmd2.length===2?'':cmd2[0][0]}</data>`);
		return [3,ins,cmd2[1]];
	}
	if (data.endsWith("~")) {
		// alias
		data = data.slice(0, -1);
		if (cmd2.length === 0 || cmd2[0]?.length>1) throw "인물(별명) - 올바르지 않은 인자(첫 번째 인자는 생략할 수 없으며 텍스트로만 구성돼야 함)";
		let ins = $(`<data class="person" data-type="alias" value="${data}" data-name="${cmd2[0][0]}">${cmd2.length===2?'':cmd2[0][0]}</data>`);
		return [3,ins,cmd2[1]];
	}
	// mention
	if (data === "") {
		// find
		if (cmd2.length === 0 || cmd2[0]?.length>1) throw "인물(추정) - 올바르지 않은 인자(첫 번째 인자는 생략할 수 없으며 텍스트로만 구성돼야 함)";
		if ($("#person_pending").length)  throw "인물(추정) - 충돌 방지(재시도하면 됨)";
		let ins = $(`<data class="person block" id="person_pending" data-type="mention">${cmd2.length===2?'':cmd2[0][0]}</data>`);
		fetchget(`/cycelog/find/person?name=${cmd2[0][0]}`).then((res) => {
			$("#person_pending").attr("value", res.code).removeClass("block").attr("id",null);
		}).catch(() => {
			$("#person_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
		});
		return [3,ins,cmd2[1]];
	}
	if (cmd2.length === 2) throw "인물(언급) - 인자가 너무 많음";
	if (cmd2.length === 1 && cmd2[0].length === 1 && cmd2[0][0] === "@") {
		// get canon name
		if ($("#name_pending").length) throw "인물(이름) - 충돌 방지(재시도하면 됨)";
		let ins = $(`<data class="person block" id="name_pending" data-type="mention" value="${data}">(@)</data>`);
		fetchget(`/cycelog/find/person?code=${data}`).then((res) => {
			$("#name_pending").text(res.name).removeClass("block").attr("id",null);
		}).catch(() => {
			$("#name_pending").replaceWith($(`<span class="error block" contenteditable="false">오류</span>`));
		});
		return [3,ins];
	}
	let ins = $(`<data class="person" data-type="mention" value="${data}">${cmd2.length?'':data}</data>`);
	return [3,ins,cmd2[0]];
}
function cmd_wrapper(cmd2) {
	if (cmd2.length > 1) throw "묶기 - 인자가 너무 많음";
	let ins = $(`<span class="wrapper"></span>`);
	return [6,ins,cmd2[0]];
}
function cmd_qm(cmd2) {
	if (cmd2.length > 1 || cmd2[0]?.length>1) throw "추가 정보 - 인자가 너무 많거나 텍스트만으로 이루어지지 않음";
	return [1, $(`<span class="qm"${cmd2.length?` data-why="${sani(cmd2[0][0])}"`:''}>`)];
}
function cmd_format(cmd2, format) {
	if (cmd2.length > 1) throw `꾸미기(${format}) - 인자가 너무 많음`;
	let ins = $(format);
	return [6,ins,cmd2[0]];
}
function cmd_namu(cmd2) {
	if (cmd2.length > 0) throw "(...) - 인자를 왜 줌(...)";
	return [0,$(`<span class="namu">`)];
}
function cmd_placeholder(cmd1,cmd2) {
	if (cmd2.length > 1) throw "대체 - 인자가 너무 많음";
	let data = cmd1.slice(3);
	let ins = $(`<data class="placeholder" value="${data}">${cmd2.length?'':data}</data>`);
	return [6,ins,cmd2[0]];
}
function cmd_fig(bef, aft, cmd2, els) {
	console.log(bef);
	console.log(aft);
	console.log(els);
	if ((bef != null && bef !== "") || (aft != null && aft !== "")) throw "정보 - 이것 외에는 내용이 없어야 함";
	if (cmd2.length <= 1) throw "정보 - 첫 번째 인자로 설명을, 그 다음부터 html을 제공해야 함";
	let flat = [];
	for (let i in cmd2) {
		if (i === "0") continue;
		if (cmd2[i].length > 1) throw -1;
		flat.push(cmd2[i][0]);
	}
	let html = flat.join("/");
	let newhtml = $(`<div id="new" class="newhtml" data-isafter="${$("#new").attr("data-isafter")}"></div>`);
	let fig = $(`<figure></figure>`);
	let cap = $(`<figcaption>`);
	put(cap, cmd2[0], els);
	fig.append(cap);
	let cont = $(`<div class="htmlwrapper">`);
	cont.get(0).innerHTML = html;
	fig.append(cont);
	newhtml.append(fig);
	$("#new").replaceWith(newhtml);
	throw -1;
}

$("#new").on("click", (e) => {
	if ($(".edit-inside").get(0) && !e.originalEvent.target.classList.contains("edit-inside")) cancel_edit_inside(false);
	if (e.originalEvent.target.classList.contains("editable")) edit_inside(e.originalEvent.target);
});

// sorry safari but I don't think I can support you


function cr_onloadweek(el) {
	if ($("#new", el).length) {
		let is_after = $("#new", el).attr("data-isafter");
		$(`.p[data-pid=${is_after}]`,el).after($("#new"));
		$("#new").before($("#newicons"));
	}
	$(".cr_icons:not(#newicons)", el).remove();
	$("h2", el).before(function () {
		let id = $(this).parent().parent().attr("data-wid");
		return $(`<div class="cr_icons weekicon">`).append($(`<button class="cr_icon delete"><svg><use href="#trash"></use></svg></button>`).on("click", () => delete_week(id)))
			.append($(`<button class="cr_icon refresh"><svg><use href="#refresh"></use></svg></button>`).on("click", () => { if (cancel_new()) reload_week(id); }))
			.append($(`<button class="cr_icon insert"><svg><use href="#down"></use></svg></button>`).on("click", () => start_new(id, true)));
	});
	$(".p", el).before(function () {
		let id = parseInt($(this).attr("data-pid"));
		return $(`<div class="cr_icons">`).append($(`<button class="cr_icon delete"><svg><use href="#trash"></use></svg></button>`).on("click", function () { delete_p(this, id); }))
			.append($(`<button class="cr_icon insert"><svg><use href="#down"></use></svg></button>`).on("click", () => start_new(id)));
	});
	let ord = parseInt(el.attr("data-order"));
	$(".makebefore", el).on("click", function() { add_week(ord-1); });
	$(".makeafter", el).on("click", function() { add_week(ord+1); });
}
window.cr_onloadweek = cr_onloadweek;

function add_week(order) {
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
	}).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 추가 실패: ${res}`); });
}

function delete_week(id) {
	console.log(id);
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
	}).catch((res) => { alert(`주차 삭제 실패: ${res}`); });
}

export function add_p() {
	if ($("#new .block").length) {
		error();
		return;
	}
	let np = $("#new").clone();
	np.attr("contenteditable", null);
	$("*", np).attr("contenteditable", null);
	$("*", np).removeClass("editable").removeClass("edit-inside");
	$("*", np).removeClass("cbefore").removeClass("cafter");
	$(".cr_icons", np).remove();
	$("*[class=\"\"]", np).attr("class", null);
	$(".noclass", np).each(function () { $(this).replaceWith($(this).contents()); });
	np.attr('id', null).attr("class", "p");
	np.html($(np).html().replace("&nbsp;"," "));
	np.get(0).normalize();
	let p = $("#new").parent();
	let body = {
		head_of_id: ($(".p:has( + #newicons)").length)?null:p.attr("data-wid"),
		parent_id: p.attr("data-wid"),
		before_id: ($(".p:has( + #newicons)").length)?$(".p:has( + #newicons)").attr("data-pid"):null,
		entries: $("a:not(.ref, .add)",np).get().map((e,i) => {
			let te = $(`time[data-entry="${i+1}"]`,np).first();
			let time = null;
			if (te.length) {
				let tv = te.attr("data-time");
				if (tv.startsWith("0*")) time = { week: 0, day: -3, hour: (tv.length>2)?parseInt(tv.slice(2,4)):null, end_hour: (tv.length>4)?parseInt(tv.slice(5,7)):null, datetime: te.attr("datetime") };
				else time = { week: parseInt(tv.slice(0,3)), day: parseInt(tv.slice(3,4)), hour: (tv.length>4)?parseInt(tv.slice(4,6)):null, end_hour: (tv.length>6)?parseInt(tv.slice(7,9)):null, datetime: te.attr("datetime") };
			}
			return {id: parseInt(e.attributes['data-for'].value), type: get_kind(e.classList), time: time}
		}),
		refs: $("a.ref",np).get().map((e) => {
			return {ref_id: parseInt(e.attributes['data-for'].value)}
		}),
		people: [],
		content: np.get(0).innerHTML
	};
	if (/^-*$/.test(body.content)) body.content = "<hr>";
	else if (body.content === "생각들") body.content = "<h3>생각들</h3>"
	else if (body.content === "정보") body.content = "<h3>정보</h3>"

	let people = {}
	for (let e of $("data.person",np)) {
		let data = {type: e.attributes['data-type']?.value, code: e.attributes['value']?.value, name: e.attributes['data-name']?.value}
		if (data.type === "mention") {
			if (!people[data.code]) people[data.code] = null;
		} else if (data.type === "alias") {
			if (!people[data.code] || people[data.code] === null) people[data.code] = {aliases: [data.name], canon: null}
			else people[data.code]['aliases'].push(data.name);
		} else if (data.type === "canon") {
			if (!people[data.code] || people[data.code] === null) people[data.code] = {aliases: [], canon: data.name}
			else people[data.code]['canon'] = data.name;
		}
	}
	for (let [k, v] of Object.entries(people)) {
		if (v === null) body.people.push({code: k, name: null, is_canon: false});
		else {
			if (v.canon !== null) body.people.push({code: k, name: v.canon, is_canon: true});
			for (let e of v.aliases) body.people.push({code: k, name: e, is_canon: false});
		}
	}
	console.log(body);
	fetchbody("/cycelog/p","POST",body).then((e) => {
		console.log(e);
		let np = get_p(e.id, e.content);
		deco(np);
		console.log(np);
		$("#new", p).before(np);
		np.before($(`<div class="cr_icons">`).append($(`<button class="cr_icon delete"><svg><use href="#trash"></use></svg></button>`).on("click", function () { delete_p(this, e.id); }))
			.append($(`<button class="cr_icon insert"><svg><use href="#down"></use></svg></button>`).on("click", () => start_new(e.id))));
		$("#new").replaceWith($(`<p id="new" data-isafter="${np.attr("data-pid")}" contenteditable="plaintext-only">`).on("keydown", input));
		$("#new").before($("#newicons"));
		$("#new").get(0).focus();
	}).catch((res) => {
		let undeco = $("#new").html();
		reload_week(p.attr("data-wid")).then(() => {
			$("#new").html(undeco);
		});
		alert(`문단 추가 실패: ${res}`);
	});
}
window.add_p = add_p;

function delete_p(el, id) {
	console.log(el);
	console.log(id);
	if (!confirm("이 문단을 삭제하겠습니까?")) return;
	fetchbody("/cycelog/p", "DELETE", {
		id: id
	}).then((res) => {
		console.log(res);
		$(`.p[data-pid=${id}]`).remove();
		el.parentElement.remove();
	}).catch((res) => {
		reload_week($(`.p[data-pid=${id}]`).parent().attr("data-wid"));
		alert(`문단 삭제 실패: ${res}`);
	});
}

function maketest() {
	fetchbody("/cycelog/week", "POST", { name: "끾주차", code: 277, order: 0, start_date: "3001-01-01", end_date: "3001-01-07", write_start_date: "4001-01-01T00:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	fetchbody("/cycelog/week", "POST", { name: "이끾주차", code: 278, order: 1, start_date: "3001-01-08", end_date: "3001-01-14", write_start_date: "4001-01-01T01:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	fetchbody("/cycelog/week", "POST", { name: "이르긲주차", code: 279, order: 2, start_date: "3001-01-15", end_date: "3001-01-21", write_start_date: "4001-01-01T02:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	fetchbody("/cycelog/week", "POST", { name: "이끼기주차", code: 280, order: 3, start_date: "3001-01-22", end_date: "3001-01-28", write_start_date: "4001-01-01T03:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	fetchbody("/cycelog/week", "POST", { name: "이이갸주차", code: 281, order: 4, start_date: "3001-01-29", end_date: "3001-02-04", write_start_date: "4001-01-01T04:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
}

function start_new(id, head) {
	if (!cancel_new()) return;
	let n = $(`<p id="new" contenteditable="plaintext-only" data-isafter="${head?-1:id}"></p>`).on("keydown", input);
	if (head) {
		$(`section[data-wid=${id}] > hgroup`).after(n);
	} else {
		$(`.p[data-pid=${id}]`).after(n);
	}
	n.before($(`<div class="cr_icons" id="newicons">`).append($(`<button class="cr_icon cancel"><svg><use href="#x"></use></svg></button>`).on("click", () => cancel_new()))
		.append($(`<button class="cr_icon insert"><svg><use href="#plus"></use></svg></button>`).on("click", () => add_p())));
	$("#new").get(0).scrollIntoView({block: "nearest"});
	$("#new").get(0).focus();
}

function cancel_new() {
	if ($("#new").length && $("#new").text().length && !confirm("추가 중인 내용을 삭제하겠습니까?")) return false;
	$("#new").remove();
	$("#newicons").remove();
	return true;
}

function init_make_button(w) {
	if (w === 0) {
		let nel = $(`<section><div class="cr_buttons cr_after"><button class="cr_button makeafter" style="display:unset;"><svg><use href="#plus"></use></button> <button class="cr_button maketest"><svg><use href="#plus"></use></button></div></section>`);
		$(".makeafter", nel).on("click", function() { add_week(0); nel.remove(); });
		$(".maketest", nel).on("click", function() { maketest(); nel.remove(); });
		$("body").append(nel);
	}
}
window.cr_onafterload.push(init_make_button);