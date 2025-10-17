class PostElement extends HTMLElement {
	#sr = null;
	
	constructor() {
		super();
		this.#sr = this.attachShadow({mode:'open'});
	}
	
	connectedCallback() {
		const template = document.getElementById('post-template').content;
		this.#sr.appendChild(template.cloneNode(true));
	}
}

$("#titleinput").on("input", (_) => {
	document.querySelectorAll("#titleinput br").forEach((e) => e.remove());
});
$("#contentinput").on("input", (_) => {
	document.querySelectorAll("#contentinput br").forEach((e) => e.remove());
});

function changeColor(c) {
	$("#newpost").attr("data-color",c);
}

customElements.define('test-post', PostElement);

const options = {
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};

function show_data(data) {
	$("#temp-posts").empty();
	for (e of data) {
		let ne = $(`<article class="test-post int" data-color="${e.color ?? 0}" onclick="delete_post(${e.id});">
			<div class="info"></div>
			<h3 class="title"></h3>
			<p class="content"></p>
		</article>`);
		$(".title",ne).append($(`<span slot="title" class="noactive">`).text(e.title));
		if (e.content) $(".content",ne).append($(`<span slot="content" class="noactive">`).text(e.content));
		$(".info",ne).append($(`<span slot="info" class="noactive dateid">`).text(`#${e.id} · ${new Date(e.date*1000).toLocaleString('ko-KR',options)}`));
		$("#temp-posts").prepend(ne);
	}
	$('#posts').html($('#temp-posts').html());
}

const url = () => localStorage.getItem("server.url");
function update_posts() {
	fetch(`${url()}/test-posts`)
	.then((res) => {
		return res.text();
	})
	.then((text) => {
		const data = JSON.parse(text);
		show_data(data);
	});
}

function refresh() {
	try {
		update_posts();
	} catch (e) {
		$("#log").css("color","var(--c-r-bright)");
		$("#log").text(`작업 실패: ${e}`);
	}
	$("#log").css("color","var(--c-g-text)");
	$("#log").text("작업 성공: 새로고침 완료");
}

function post() {
	let title = document.getElementById("titleinput").textContent;
	let content = document.getElementById("contentinput").textContent;
	let color = document.getElementById("newpost").getAttribute("data-color");
	if (!title) {
		$("#log").css("color","var(--c-r-bright)");
		$("#log").text("작업 실패: 제목 없음");
		return;
	}
	let data = {title: title, content: content, color: color};
	fetch(`${url()}/test-posts`, {
		method: "POST",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify(data)
	})
	.then((res) => {
		return res.text();
	})
	.then((text) => {
		const data = JSON.parse(text);
		show_data(data);
		$("#log").css("color","var(--c-g-text)");
		$("#log").text("작업 성공: 글 추가됨");
	})
	.catch((e) => {
		$("#log").css("color","var(--c-r-bright)");
		$("#log").text(`작업 실패: ${e}`);
	});
}

function delete_post(id) {
	fetch(`${url()}/test-posts`, {
		method: "DELETE",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify({id: id})
	})
	.then((res) => {
		return res.text();
	})
	.then((text) => {
		const data = JSON.parse(text);
		show_data(data);
		$("#log").css("color","var(--c-r-text)");
		$("#log").text("작업 성공: 글 삭제됨");
	}).catch((e) => {
		$("#log").css("color","var(--c-r-bright)");
		$("#log").text(`작업 실패: ${e}`);
	});;
}

update_posts();
window.setInterval(update_posts, 1000);