import { fetchget } from '../../global/util.js';
import { d$ } from './util.js';
import { dialog } from './dialog.js';
import { reload_week } from "./load.js";
import { get_new } from './editcmd.js';
import { add_week, delete_week, add_p, edit_p, delete_p, maketest } from './editload.js';

export function make_init_buttons() {
	let nel = $(`<section><div class="cr_buttons cr_after"><button class="cr_button makeafter" style="display:unset;"><svg><use href="#plus"></use></button> <button class="cr_button maketest"><svg><use href="#plus"></use></button></div></section>`);
	$(".makeafter", nel).on("click", function() { add_week(0); nel.remove(); });
	$(".maketest", nel).on("click", function() { maketest(); nel.remove(); });
	$("body").append(nel);
}

export function make_edit_buttons(el) {
	if ($("#new", el).length) {
		let is_after = $("#new", el).attr("data-isafter");
		$(`.p[data-pid=${is_after}]`,el).after($("#new"));
		$("#new").before($("#newicons"));
	}
	$("h2:not(:has( > .cr_icons))", el).prepend(function () {
		let id = $(this).parent().parent().attr("data-wid");
		return $(`<div class="cr_icons weekicon">`).append($(`<button class="cr_icon delete"><svg><use href="#trash"></use></svg></button>`).on("click", () => delete_week(id)))
			.append($(`<button class="cr_icon refresh"><svg><use href="#refresh"></use></svg></button>`).on("click", () => { if (cancel_new()) reload_week(id); }))
			.append($(`<button class="cr_icon insert"><svg><use href="#down"></use></svg></button>`).on("click", () => start_new(id, true)));
	});
	$("hr", el).replaceWith(function () {
		return $(`<p class="p htmlp" data-pid="${this.attributes['data-pid'].value}"><br></p>`);
	})
	$(".p", el).prepend(p_icons);
	let ord = parseInt(el.attr("data-order"));
	$(".makebefore", el).on("click", function() { add_week(ord-1); });
	$(".makeafter", el).on("click", function() { add_week(ord+1); });
}

export function p_icons() {
	let id = parseInt($(this).attr("data-pid"));
	return $(`<div class="cr_icons">`).append($(`<button class="cr_icon delete"><svg><use href="#trash"></use></svg></button>`).on("click", function () { delete_p(id); }))
		.append($(`<button class="cr_icon edit"><svg><use href="#edit"></use></svg></button>`).on("click", () => start_edit(id)))
		.append($(`<button class="cr_icon insert"><svg><use href="#down"></use></svg></button>`).on("click", () => start_new(id)));
}

function start_new(id, head) {
	if (!cancel_new()) return;
	let n = get_new(head?-1:id);
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

async function start_edit(id) {
	if (!cancel_new()) return;
	if ($(`.p[data-pid=${id}]`).hasClass("htmlp")) {
		alert("이 문단은 편집할 수 없습니다.");
		return;
	}
	let n = get_new(id);
	$(`.p[data-pid=${id}]`).after(n);
	n.before($(`<div class="cr_icons editnewicons" id="newicons">`).append($(`<button class="cr_icon cancel"><svg><use href="#x"></use></svg></button>`).on("click", () => cancel_new()))
		.append($(`<button class="cr_icon edit"><svg><use href="#up"></use></svg></button>`).on("click", () => edit_p())));
	let orig = (await fetchget(`/cycelog/p?id=${id}`)).content;
	n.html(orig);
	$("data, time, span.qm", n).on("click", dialog);
	$("*", n).attr("contenteditable", "false");
	$("*:not(span.namu, span.end, .e.add, span.qm)", n).addClass("editable");
	$("#new").get(0).scrollIntoView({block: "nearest"});
	window.getSelection().selectAllChildren(d$("new"));
}

export function apply_new() {
	(d$("newicons").classList.contains("editnewicons"))?edit_p():add_p();
}

export function cancel_new() {
	if ($("#new").length && $("#new").text().length && !confirm("추가 중인 내용을 삭제하겠습니까?")) return false;
	$("#new").remove();
	$("#newicons").remove();
	return true;
}