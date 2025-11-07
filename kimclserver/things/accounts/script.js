import { showmsg, fetchbody } from "../../global/util.js";

window.create_account = function create_account() {
	let data = {username: $("#createid").val(), password: $("#createpw").val()};
	fetchbody("/create-account", "POST", data)
	.then((_) => {
		showmsg("makelog", "작업 성공: 계정 생성됨", "5-c");
	}).catch((e) => {
		//console.error(e);
		showmsg("makelog", `작업 실패: ${e}`, "1-0");
	});
}

window.change_password = function change_password() {
	let data = {username: $("#changeid").val(), password: $("#changepw").val()};
	fetchbody("/change-password", "POST", data)
	.then((_) => {
		showmsg("changelog", "작업 성공: 비밀번호 변경됨", "3-c");
	}).catch((e) => {
		//console.error(e);
		showmsg("changelog", `작업 실패: ${e}`, "1-0");
	});
}

window.delete_account = function delete_account() {
	let data = {username: $("#deleteid").val(), password: null};
	fetchbody("/delete-account", "POST", data)
	.then((_) => {
		showmsg("deletelog", `작업 성공: 계정 삭제됨`, "1-c");
	}).catch((e) => {
		//console.error(e);
		showmsg("deletelog", `작업 실패: ${e}`, "1-0");
	});
}
$("#delete").on("submit", delete_account);