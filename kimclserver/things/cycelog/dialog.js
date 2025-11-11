import { fetchget } from '../../global/util.js';
import { d$ } from './util.js';
import { to_fragment } from "./load.js";

const INFO_PAGE_FLAG = window.location.pathname.endsWith("entry.html") ||  window.location.pathname.endsWith("person.html");

// selectable text
$(window).on("resize", () => {
	if (!cur_el) return;
	move_dialog();
});

export const dialog = (e) => {
	attach_dialog(e.currentTarget, e.clientY);
	e.stopPropagation();
};

var cur_el = null;
var cur_box = null;
async function attach_dialog(el, clicky) {
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
	await create_dialog();
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

async function create_dialog() {
	let el = $(cur_el);
	if (el.hasClass("e")) {
		if (el.hasClass("add")) {
			$("body").append(dialog_base().append(`<span>수첩 기록 시엔 없었으나<br>
				${(el.hasClass("add3")?"3차 기록 중":(el.hasClass("add1")?"1차 기록 중":"이후"))} 추가한 내용</span>`));
			return;
		}
		if (el.hasClass("ref")) {
			if (INFO_PAGE_FLAG) {
				$("body").append(dialog_base().append(`<span>${el.val()}번 기록 언급<br></span>`)
					.append($(`<a href="./viewer.html#p${el.closest(".p").attr("data-pid")}">기록에서 보기</a>`))
					.append("<br>").append($(`<a href="./entry.html?id=${el.val()}">관련 정보 보기</a>`)));
				return;
			}
			$("body").append(dialog_base().append(`<span>${el.val()}번 기록 언급<br></span>`)
				.append($(`<button type="button">기록으로 이동</button>`).on("click",()=>to_fragment(`#a${el.val()}`)))
				.append("<br>").append($(`<a href="./entry.html?id=${el.val()}">관련 정보 보기</a>`)));
			return;
		}
		if (INFO_PAGE_FLAG) {
			$("body").append(dialog_base().append(`<span>${el.val()}번 기록<br></span>`)
				.append($(`<a href="./viewer.html#a${el.val()}">기록에서 보기</a>`))
				.append("<br>").append($(`<a href="./entry.html?id=${el.val()}">관련 정보 보기</button>`)));
			return;
		}
		$("body").append(dialog_base().append(`<span>${el.val()}번 기록<br></span>`)
			.append($(`<button type="button">링크 복사</button>`).on("click",()=>{
				navigator.clipboard.writeText(`${window.location.host}${window.location.pathname}#a${el.val()}`);
			}))
			.append("<br>").append($(`<a href="./entry.html?id=${el.val()}">관련 정보 보기</a>`)));
		return;
	}
	if (el.hasClass("qm")) {
		$("body").append(dialog_base().append(`<span>${el.attr("data-why") ?? "진위 여부나 단어 선택의 적절성이 검증되지 않음"}</span>`));
		return;
	}
	if (el.hasClass("person")) {
		if (INFO_PAGE_FLAG) {
			$("body").append(dialog_base().append(`<span>${el.val()} · ${await fetchget(`/cycelog/find/person?code=${el.val()}`)
				.then((res) => res.name)}<br></span>`)
				.append($(`<a href="./viewer.html#p${el.closest(".p").attr("data-pid")}">기록에서 보기</a>`))
				.append("<br>").append($(`<a href="./person.html?code=${el.val()}">관련 정보 보기</a>`)));
			return;
		}
		$("body").append(dialog_base().append(`<span>${el.val()} · ${await fetchget(`/cycelog/find/person?code=${el.val()}`)
			.then((res) => res.name)}<br></span>`)
			.append($(`<a href="./person.html?code=${el.val()}">관련 정보 보기</a>`)));
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
		$("body").append(dialog_base().append(`<span>${el.val()} · ${el.parent().prev().text()}<br></span>`));
		return;
	}
	$("body").append(dialog_base().append(`<span>???</span>`));
	return;
}

export function remove_dialog(e) {
	if (e.id !== "dialog") return;
	$(e).css("opacity",0).addClass("closing").removeAttr("id");
	$(".selected").removeClass("selected");
	cur_el = cur_box = null;
}