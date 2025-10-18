import { showmsg, fetchget, fetchbody } from "../../global/util.js";

$("#titleinput").on("input", (_) => {
	$("#titleinput br").remove();
});
$("#contentinput").on("input", (_) => {
	$("#contentinput br").remove();
});

window.change_color = function changeColor(c) {
	$("#newpost").attr("data-color",c);
}

const options = {
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};

window.show_data = function show_data(data) {
	$("#temp-posts").empty();
	for (let e of data) {
		let ne = $(`<article class="test-post int" data-color="${e.color ?? 0}" onclick="delete_post(${e.id});">
			<div class="info"></div>
			<h3 class="title"></h3>
			<p class="content"></p>
		</article>`);
		$(".title",ne).append($(`<span slot="title" class="noactive" onclick="event.stopPropagation();">`).text(e.title));
		if (e.content) $(".content",ne).append($(`<span slot="content" class="noactive" onclick="event.stopPropagation();">`).text(e.content));
		$(".info",ne).append($(`<span slot="info" class="noactive dateid" onclick="event.stopPropagation();">`).text(`#${e.id} · ${new Date(e.date*1000).toLocaleString('ko-KR',options)}`));
		$("#temp-posts").prepend(ne);
	}
	$('#posts').html($('#temp-posts').html());
}

function update_posts() {
	fetchget("/test-posts/")
	.then((data) => show_data(data));
}

window.get_data = function get_data() {
	try {
		update_posts();
	} catch (e) {
		showmsg("log", `작업 실패: ${e}`, "r-bright");
		return;
	}
	showmsg("log", "작업 성공: 새로고침 완료", "g-text");
}

window.post = function post() {
	let title = $("#titleinput").text();
	let content = $("#contentinput").text();
	let color = $("#newpost").attr("data-color");
	if (!title) {
		showmsg("log", "작업 실패: 제목 없음", "r-bright");
		return;
	}
	fetchbody("/test-posts/", "POST", {title: title, content: content, color: color})
	.then((data) => {
		show_data(data);
		showmsg("log", "작업 성공: 글 추가됨", "g-text");
	})
	.catch((e) => {
		showmsg("log", `작업 실패: ${e}`, "r-bright");
	});
}

window.delete_post = function delete_post(id) {
	fetchbody("/test-posts/", "DELETE", {id: id})
	.then((data) => {
		show_data(data);
		showmsg("log", "작업 성공: 글 삭제됨", "r-text");
	}).catch((e) => {
		showmsg("log", `작업 실패: ${e}`, "r-bright");
	});
}

update_posts();
//window.setInterval(update_posts, 1000);