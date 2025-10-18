export const url = () => localStorage.getItem("server.url");

export function logininfo() {
	return {id: localStorage.getItem("server.loginid"), time: localStorage.getItem("server.logintime"), hash: localStorage.getItem("server.loginhash")};
}

export function showmsg(id, msg, color, time) {
	$(`#${id}`).css("visibility","visible");
	if (color) $(`#${id}`).css("color",`var(--c-${color})`);
	$(`#${id}`).text(msg);
	window.clearTimeout($(`#${id}`).attr("data-timeout"));
	$(`#${id}`).attr("data-timeout",window.setTimeout(() => {$(`#${id}`).css("visibility","hidden")}, time??1000));
}

export async function fetchget(path) {
	const res = await fetch(`${url()}${path}`);
	if (!res.ok) res.json().then((data) => { throw `${res.status};;${data.detail??''}`; });
	return await res.json();
}

export async function fetchbody(path, method, body) {
	const res = await fetch(`${url()}${path}`, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) res.json().then((data) => { throw `${res.status};;${data.detail??''}`; });
	return await res.json();
}