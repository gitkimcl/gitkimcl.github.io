import { SHA256 } from "../../../../global/sha256.js";

export function create_account() {
	let data = {};
	$.map($("#create").serializeArray(), (e,_) => {
		data[e['name']] = e['value'];
	});
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetch(`${localStorage.getItem("server.url")}/create-account`, {
		method: "POST",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify(data)
	})
	.then((res) => {
		return res.json();
	}).then((data) => {
		console.log(data);
	}).catch((e) => {
		console.error(e);
	});
}
$("#create").on("submit", create_account);

export function delete_account() {
	let data = {};
	$.map($("#delete").serializeArray(), (e,_) => {
		data[e['name']] = e['value'];
	});
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetch(`${localStorage.getItem("server.url")}/delete-account`, {
		method: "POST",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify(data)
	})
	.then((res) => {
		return res.json();
	}).then((data) => {
		console.log(data);
	}).catch((e) => {
		console.error(e);
	});
}
$("#delete").on("submit", delete_account);