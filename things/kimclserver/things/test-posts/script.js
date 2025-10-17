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

document.getElementById("titleinput").oninput = (_) => {
	document.querySelectorAll("#titleinput br").forEach((e) => e.remove());
};

document.getElementById("contentinput").oninput = (_) => {
	document.querySelectorAll("#contentinput br").forEach((e) => e.remove());
};

function changeColor(c) {
	document.getElementById("newpost").setAttribute("data-color",c);
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
	document.getElementById("temp-posts").innerHTML = '';
	for (e of data) {
		let ne = document.createElement('test-post');
		ne.classList.add("int");
		ne.setAttribute('data-color', e.color ?? 0);
		ne.setAttribute('onclick', `delete_post(${e.id})`);
		let title = document.createElement('span');
		title.classList.add("noactive");
		title.setAttribute('slot','title');
		title.textContent = e.title;
		let content = document.createElement('span');
		content.classList.add("noactive");
		content.setAttribute('slot','content');
		content.textContent = e.content;
		let info = document.createElement('span');
		info.classList.add("noactive");
		info.classList.add("dateid");
		info.setAttribute('slot','info');
		info.textContent = `#${e.id} · ${new Date(e.date*1000).toLocaleString('ko-KR',options)}`;
		ne.appendChild(title);
		if (e.content) ne.appendChild(content);
		ne.appendChild(info);
		document.getElementById('temp-posts').prepend(ne);
	}
	document.getElementById('posts').innerHTML = document.getElementById('temp-posts').innerHTML;
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
		document.getElementById("log").style.color = "var(--c-r-bright)";
		document.getElementById("log").textContent = `작업 실패: ${e}`;
	}
	document.getElementById("log").style.color = "var(--c-g-text)";
	document.getElementById("log").textContent = "작업 성공: 새로고침 완료";
}

function post() {
	let title = document.getElementById("titleinput").textContent;
	let content = document.getElementById("contentinput").textContent;
	let color = document.getElementById("newpost").getAttribute("data-color");
	if (!title) {
		document.getElementById("log").style.color = "var(--c-r-bright)";
		document.getElementById("log").textContent = "작업 실패: 제목 없음";
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
		document.getElementById("log").style.color = "var(--c-g-text)";
		document.getElementById("log").textContent = "작업 성공: 글 추가됨";
	})
	.catch((e) => {
		document.getElementById("log").style.color = "var(--c-r-bright)";
		document.getElementById("log").textContent = `작업 실패: ${e}`;
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
		document.getElementById("log").style.color = "var(--c-r-text)";
		document.getElementById("log").textContent = "작업 성공: 글 삭제됨";
	}).catch((e) => {
		document.getElementById("log").style.color = "var(--c-r-bright)";
		document.getElementById("log").textContent = `작업 실패: ${e}`;
	});;
}

update_posts();
window.setInterval(update_posts, 1000);