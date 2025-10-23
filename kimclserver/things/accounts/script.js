import { SHA256 } from "../../../global/sha256.js";
import { showmsg, fetchbody } from "../../global/util.js";

const url = () => localStorage.getItem("server.url");

window.create_account = function create_account() {
	let data = {id: $("#createid").val(), pw: $("#createpw").val()};
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetchbody("/create-account", "POST", data)
	.then((data) => {
		showmsg("makelog", "작업 성공: 계정 생성됨", "g-text");
	}).catch((e) => {
		//console.error(e);
		showmsg("makelog", `작업 실패: ${e}`, "r-bright");
	});
}

window.delete_account = function delete_account() {
	let data = {id: $("#deleteid").val(), pw: $("#deletepw").val()};
	data['pw'] = SHA256(`${data['id']}ecyce${data['pw']}`);
	fetchbody("/delete-account", "POST", data)
	.then((data) => {
		showmsg("makelog", `작업 성공: 계정 삭제됨`, "r-text");
	}).catch((e) => {
		//console.error(e);
		showmsg("deletelog", `작업 실패: ${e}`, "r-bright");
	});
}
$("#delete").on("submit", delete_account);