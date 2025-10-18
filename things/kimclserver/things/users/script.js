import { SHA256 } from "../../../../global/sha256.js";

const url = () => localStorage.getItem("server.url");

export function create_account() {
	let data = {id: $("#createid").val(), pw: $("#createpw").val()};
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetch(`${url()}/create-account`, {
		method: "POST",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify(data)
	})
	.then((res) => {
		return res.json();
	}).then((data) => {
		$("#makelog").text(data);
	}).catch((e) => {
		//console.error(e);
		$("#makelog").text(`작업 실패: ${e}`);
	});
}
$("#create").on("submit", create_account);

export function delete_account() {
	let data = {id: $("#deleteid").val(), pw: $("#deleteid").val()};
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetch(`${url()}/delete-account`, {
		method: "POST",
		headers: {
            "Content-Type": "application/json",
        },
		body: JSON.stringify(data)
	})
	.then((res) => {
		return res.json();
	}).then((data) => {
		$("#deletelog").text(data);
	}).catch((e) => {
		//console.error(e);
		$("#deletelog").text(`작업 실패: ${e}`);
	});
}
$("#delete").on("submit", delete_account);