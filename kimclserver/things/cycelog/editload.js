import { fetchbody } from '../../global/util.js';
import { deco, get_p, get_kind } from './util.js';
import { load_week, reload_week } from "./load.js";
import { get_new } from "./editcmd.js";
import { p_icons } from "./editui.js";

export function add_week(order) {
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

export function delete_week(id) {
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
			$(".loadafter > svg > use",prev).attr("href", "#between");
			$(".cr_before",next).addClass("hidden");
		} else if (parseInt(next.attr("data-order")) - parseInt(prev.attr("data-order")) === 3) {
			$(".loadafter > svg > use",prev).attr("href", "#down");
			$(".loadbefore > svg > use",next).attr("href", "#up");
			$(".cr_after",prev).removeClass("hidden");
			$(".cr_before",next).removeClass("hidden");
		} else if (!prev.attr("data-order")) {
			$(".loadbefore > svg > use",next).attr("href", "#up");
			$(".cr_before",next).removeClass("hidden");
		} else if (!next.attr("data-order")) {
			$(".loadafter > svg > use",prev).attr("href", "#down");
			$(".cr_after",prev).removeClass("hidden");
		}
		$(`section[data-wid=${id}]`).remove();
	}).catch((res) => { alert(`주차 삭제 실패: ${res}`); });
}

function get_p_body(el) {
	let entries = [];
	let eel = $(".e:not(.ref, .add)",el).get();
	for (let i in eel) {
		let te = $(`time[data-entry="${parseInt(i)+1}"]`,el).first();
		let time = null;
		if (te.length) {
			let tv = te.attr("data-time");
			if (tv.startsWith("0*")) time = {
				week: 0, day: -3,
				hour: (tv.length>2)?parseInt(tv.slice(2,4)):null,
				end_hour: (tv.length>4)?parseInt(tv.slice(5,7)):null, datetime: te.attr("datetime")
			};
			else time = {
				week: parseInt(tv.slice(0,3)), day: parseInt(tv.slice(3,4)),
				hour: (tv.length>4)?parseInt(tv.slice(4,6)):null,
				end_hour: (tv.length>6)?parseInt(tv.slice(7,9)):null, datetime: te.attr("datetime")
			};
		}
		entries.push({
			id: parseInt(eel[i].attributes['value'].value),
			type: get_kind(eel[i].classList), time: time
		});
	}

	let refs = [];
	let rtmp = [];
	for (let e of $(".e.ref",el).get()) {
		let rid = parseInt(e.attributes['value'].value);
		if (rtmp.includes(rid)) continue;
		refs.push({ref_id: rid});
		rtmp.push(rid);
	};

	let people = [];
	let ptmp = {}
	for (let e of $("data.person",el)) {
		let data = {type: e.attributes['data-type']?.value, code: e.attributes['value']?.value, name: e.attributes['data-name']?.value}
		if (data.type === "mention") {
			if (!ptmp[data.code]) ptmp[data.code] = null;
		} else if (data.type === "alias") {
			if (!ptmp[data.code] || ptmp[data.code] === null) ptmp[data.code] = {aliases: [data.name], canon: null}
			else ptmp[data.code]['aliases'].push(data.name);
		} else if (data.type === "canon") {
			if (!ptmp[data.code] || ptmp[data.code] === null) ptmp[data.code] = {aliases: [], canon: data.name}
			else ptmp[data.code]['canon'] = data.name;
		}
	}
	for (let [k, v] of Object.entries(ptmp)) {
		if (v === null) people.push({code: k, name: null, is_canon: false});
		else {
			if (v.canon !== null) people.push({code: k, name: v.canon, is_canon: true});
			for (let e of v.aliases) people.push({code: k, name: e, is_canon: false});
		}
	}
	$("*", el).attr("data-type", null).attr("data-name", null);

	let content = (el.get(0).tagName === "P") ? el.get(0).innerHTML : "<!--OUTER-->"+el.get(0).outerHTML;
	if (!content.length) content = "<!--OUTER--><hr>";
	let textcontent = el.get(0).textContent;
	return {entries: entries, refs: refs, people: people, content: content.replace(/\s+/g, " "), textcontent: textcontent.replace(/\s+/g, " ")};
}

export function add_p() {
	if ($("#new .block").length) {
		error();
		return;
	}

	let np = $("#new").clone().attr("id",null).attr("class",null).attr("data-isafter",null).attr("style",null);
	$("*", np).attr("contenteditable", null);
	$("*", np).removeClass("editable").removeClass("edit-inside");
	$("*", np).removeClass("cbefore").removeClass("cafter");
	$("*[class=\"\"]", np).attr("class", null);
	np.html($(np).html().replace("&nbsp;"," "));
	np.get(0).normalize();
	let body = get_p_body(np);
	let p = $("#new").parent();
	body.parent_id = p.attr("data-wid");
	body.head_of_id = body.before_id = null;
	if ($("#new").attr("data-isafter")=="-1") body.head_of_id = p.attr("data-wid");
	else body.before_id = $("#new").attr("data-isafter");
	console.log(body);
	fetchbody("/cycelog/p","POST",body).then((e) => {
		console.log(e);
		let np = get_p(e.id, e.content);
		if (np.get(0).tagName === "HR") np = get_p(e.id, "<br>").addClass("htmlp");
		deco(np);
		$("#new", p).before(np);
		np.prepend(p_icons);
		$("#new").replaceWith(get_new(np.attr("data-pid")));
		$("#new").before($("#newicons"));
		$("#new").get(0).focus();
	}).catch((res) => {
		let undeco = $("#new").html();
		reload_week(p.attr("data-wid")).then(() => $("#new").html(undeco));
		alert(`문단 추가 실패: ${res}`);
	});
}

export function edit_p() {
	if ($("#new .block").length) {
		error();
		return;
	}

	let np = $("#new").clone().attr("id",null).attr("class",null).attr("data-isafter",null).attr("style",null);
	$("*", np).attr("contenteditable", null);
	$("*", np).removeClass("editable").removeClass("edit-inside");
	$("*", np).removeClass("cbefore").removeClass("cafter");
	$("*[class=\"\"]", np).attr("class", null);
	np.html($(np).html().replace("&nbsp;"," "));
	np.get(0).normalize();
	let body = get_p_body(np);
	body.id = $("#new").attr("data-isafter");
	console.log(body);
	fetchbody("/cycelog/p","PUT",body).then((e) => {
		console.log(e);
		let np = get_p(e.id, e.content);
		if (np.get(0).tagName === "HR") np = get_p(e.id, "<br>").addClass("htmlp");
		deco(np);
		$(`.p[data-pid=${e.id}]`).replaceWith(np);
		np.prepend(p_icons);
		$("#new").replaceWith(get_new(np.attr("data-pid")));
		$("#new").html(e.content);
		window.getSelection().selectAllChildren($("#new").get(0));
	}).catch((res) => {
		alert(`문단 수정 실패: ${res}`);
	});
}

export function delete_p(id) {
	if (!confirm("이 문단을 삭제하겠습니까?")) return;
	fetchbody("/cycelog/p", "DELETE", {
		id: id
	}).then((res) => {
		console.log(res);
		$(`.p[data-pid=${id}]`).remove();
	}).catch((res) => {
		reload_week($(`.p[data-pid=${id}]`).parent().attr("data-wid"));
		alert(`문단 삭제 실패: ${res}`);
	});
}

export async function maketest() {
	await fetchbody("/cycelog/week", "POST", { name: "끾주차", code: 277, order: 0, start_date: "3001-01-01", end_date: "3001-01-07", write_start_date: "4001-01-01T00:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	await fetchbody("/cycelog/week", "POST", { name: "이끾주차", code: 278, order: 1, start_date: "3001-01-08", end_date: "3001-01-14", write_start_date: "4001-01-01T01:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	await fetchbody("/cycelog/week", "POST", { name: "이르긲주차", code: 279, order: 2, start_date: "3001-01-15", end_date: "3001-01-21", write_start_date: "4001-01-01T02:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	await fetchbody("/cycelog/week", "POST", { name: "이끼기주차", code: 280, order: 3, start_date: "3001-01-22", end_date: "3001-01-28", write_start_date: "4001-01-01T03:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });
	await fetchbody("/cycelog/week", "POST", { name: "이이갸주차", code: 281, order: 4, start_date: "3001-01-29", end_date: "3001-02-04", write_start_date: "4001-01-01T04:00" }).then((res) => { load_week(res.data.id) }).catch((res) => { alert(`주차 생성 실패: ${res}`); });

	const complete_body = (b, pid, hid, bid) => { b.parent_id = pid; b.head_of_id = hid; b.before_id = bid; return b; }
	let test = $(await (await fetch('./test.html')).text());
	let id = null;
	for (let e of $("section",test).get()) {
		console.log(e);
		for (let ee of $(e).children()) {
			console.log(id);
			id = (await fetchbody("/cycelog/p", "POST", complete_body(get_p_body($(ee)), $(e).attr("data-wid"), (id==null)?$(e).attr("data-wid"):null, (id==null)?null:id))).id;
		}
		id = null;``
	}
	reload_week(1); reload_week(2); reload_week(3); reload_week(4); reload_week(5);
}