export const url = () => localStorage.getItem("server.url");

export function logged_in() {
	if (!localStorage.getItem("server.username") || !localStorage.getItem("server.token")) return false;
	return true;
}

export async function login(form) {
	const res = await fetch(`${url()}/login`, {
		method: "POST",
		body: new FormData(form)
	});
	if (!res.ok) {
		if (res.status == 401) {
			alert("로그인 실패");
			return;
		}
		const data = await res.json();
		throw `${res.status};;${JSON.stringify(data.detail)??''}`;
	}
	let data = await res.json();
	localStorage.setItem("server.username", data.username);
	localStorage.setItem("server.token", data.access_token);
	if (data.is_admin) localStorage.setItem("server.is_admin", "true");
}

export async function logout() {
	localStorage.removeItem("server.username");
	localStorage.removeItem("server.token");
	localStorage.removeItem("server.is_admin");
}

export function showmsg(id, msg, color, time) {
	$(`#${id}`).css("visibility","visible");
	if (color) $(`#${id}`).css("color",`var(--c-${color})`);
	$(`#${id}`).text(msg);
	window.clearTimeout($(`#${id}`).attr("data-timeout"));
	$(`#${id}`).attr("data-timeout",window.setTimeout(() => {$(`#${id}`).css("visibility","hidden")}, time??1000));
}

export async function fetchget(path) {
	const res = await fetch(`${url()}${path}`, {
		headers: {
			...(logged_in() && {"Authorization": `Bearer ${localStorage.getItem("server.token")}`})
		},
	});
	if (!res.ok) {
		const data = await res.json();
		if (res.status === 401) {
			alert(data.detail);
			logout();
			return;
		}
		throw `${res.status};;${data.detail??''}`;
	}
	return await res.json();
}

export async function fetchbody(path, method, body) {
	const res = await fetch(`${url()}${path}`, {
		method: method,
		headers: {
			...(logged_in() && {"Authorization": `Bearer ${localStorage.getItem("server.token")}`}),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		if (res.status === 401) {
			alert(res.detail);
			logout();
			return;
		}
		const data = await res.json();
		throw `${res.status};;${JSON.stringify(data.detail)??''}`;
	}
	return await res.json();
}