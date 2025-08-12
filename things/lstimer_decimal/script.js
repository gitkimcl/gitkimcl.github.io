var store = {"target":undefined,"zero":undefined,"running":false,"name":"","link":"","ring":1};
function save() {
	let now = new Date();
	if (store.target==undefined || store.target<now) {
		store.target = now;
		store.zero=true;
		reload_date();
		set_vnum(0);
		set_rnum(0);
	} else {
		store.zero = false;
	}
	localStorage.setItem("store", JSON.stringify(store));
}

function load() {
	let now = new Date();
	if (localStorage.getItem("store")!=null) store = JSON.parse(localStorage.getItem("store"));
	if (store.zero || store.target==undefined || new Date(store.target)<now) {
		store.target=now;
		store.zero=true;
	} else {
		store.target = new Date(store.target);
	}
	reload_date();

	if (store.name!=undefined) $("#nameinput").val(store.name);
	else store.name="";
	if (store.link!=undefined) $("#linkinput").val(store.link);
	else store.link="";
	set_title(store.name);

	if (store.ring==undefined) store.ring=1;
	reload_ringnum();
	reload_hue();

	if (store.running) start_timer();
	localStorage.setItem("store", JSON.stringify(store));
}

function reload_date() {
	$("#dyear").text(store.target.getFullYear());
	$("#dmonth").text(store.target.getMonth()+1);
	$("#dday").text(store.target.getDate());
	$("#dhour").text(store.target.getHours());
	$("#dmin").text(store.target.getMinutes());
	$("#dateinput").val(new Date(input_date().valueOf()-new Date().getTimezoneOffset() * 60000).toISOString().substring(0,16));
}

function reload_ringnum() {
	$(".glowring").removeClass("transparent");
	for (let i=0; i<=8; i++) {
		if (i>=store.ring) break;
		$(`#r${i}`).addClass("transparent");
	}
	$(".ringnum").text(9-store.ring);
}


function set_var(name,value) { $(":root").css(name,value); }
function reset_var(name) { $(":root").css(name,""); }


var icon = "";
function set_icon(name) {
	if (name==icon) return;
	icon=name;
	$("#fav").attr("href",`icon/ring${name}.ico`);
}

var title="loading";
function set_title(name) {
	if (name==undefined || name==title) return;
	title=name;
	$("#title").text(name);
}

var huetrans = true;
function set_huetrans(val) {
	if (val==huetrans) return;
	huetrans=val;
	if (huetrans) reset_var("--default-trans");
	else set_var("--default-trans","none");
}


var rdigits=[0,0,0,0,0,0,0,0,0]; // real digits
var vdigits=[0,0,0,0,0,0,0,0,0]; // visual digits

function get_rnum() {
	let result=0;
	for (let i=0; i<=8; i++) {
		result*=10;
		result+=rdigits[i];
	}
	return result;
}
 
function set_vnum(num) {
	for (let i=8; i>=0; i--) {
		set_vdigit(i,num%10);
		num=Math.floor(num/10);
	}
}

function set_vdigit(dnum,val) {
	$(`.d${dnum}`).text(val<10?val:String.fromCharCode(55+val));
	vdigits[dnum]=val;
}

function set_rnum(num) {
	for (let i=8; i>=0; i--) {
		rdigits[i] = num%10;
		num=Math.floor(num/10);
	}
}

var in_animation = false;
var cur_animation = 0;
function anim_vnum(num,duration) {
	in_animation = true;
	cur_animation++;
	let isUp = get_rnum()<num;
	set_rnum(num);
	
	let cur, steps, point;
	for (let i=8; i>=0; i--) {
		cur=rdigits[i];
		if (isUp) {
			point=vdigits[i];
			steps=(cur-point+10)%10;
			for (let j=0; j<steps; j++) {
				point++;
				point%=10;
				window.setTimeout(set_vdigit_anim,duration/steps*j,i,point,cur_animation);
			}
		} else {
			point=vdigits[i];
			steps=(point-cur+10)%10;
			for (let j=0; j<steps; j++) {
				point--;
				if (point<0) point+=10;
				window.setTimeout(set_vdigit_anim,duration/steps*j,i,point,cur_animation);
			}
		}
	}

	window.setTimeout(function(num,code) {
		if (cur_animation != code) return;
		in_animation = false;
		set_vnum(num);
	},duration+10,num,cur_animation);
}

function set_vdigit_anim(dnum,val,code) {
	if (cur_animation != code) return;
	$(`.d${dnum}`).text(val<10?val:String.fromCharCode(55+val));
	vdigits[dnum]=val;
}


var is_editing_name = false;
$("#nameedit").on("click",function() {
	if (store.running||is_editing_date) return;
	if (is_editing_name) {
		window.setTimeout(close_linkinput,10);
		is_editing_name=false;
		store.name=$("#nameinput").val();
		store.link=$("#linkinput").val();
		save();
	} else {
		$(".ligroup").removeClass("hidden");
		window.setTimeout(open_linkinput,10);
		is_editing_name=true;
	}
});

var close_killcode;
function open_linkinput() {
	window.clearInterval(close_killcode);
	$("#nameinput").prop("readonly",false);
	$("#linkinput").prop("readonly",false);
	$("#nameedit .nameplus").addClass("glowmore");
	$(".nedisplay").addClass("glowmore");
	$("#inputs .glowborder").addClass("glowmore");
	$("#inputs input").addClass("glowplaceholder");
	$(".ligroup").addClass("liopen");
	$(".nameplus").addClass("pluson");
}

function close_linkinput() {
	window.clearInterval(close_killcode);
	$("#nameinput").prop("readonly",true);
	$("#linkinput").prop("readonly",true);
	$("#nameedit .nameplus").removeClass("glowmore");
	$(".nedisplay").removeClass("glowmore");
	$("#inputs .glowborder").removeClass("glowmore");
	$("#inputs input").removeClass("glowplaceholder");
	$(".ligroup").removeClass("liopen");
	$(".nameplus").removeClass("pluson");
	close_killcode=window.setTimeout(function() {
		$(".ligroup").addClass("hidden");
	},1010);
}


var is_editing_date=false;
$("#dateedit").on("click",function() {
	if (store.running||is_editing_name) return;
	if (is_editing_date) {
		window.setTimeout(close_dateedit,10);
		store.target = input_date();
		anim_vnum(0,500);
		set_rnum(0);
		is_editing_date=false;
		save();
	} else {
		if (!store.zero) anim_vnum(until(input_date()),500);
		window.setTimeout(open_dateedit,10);
		is_editing_date=true;
	}
});

function open_dateedit() {
	$(".datecontainer").addClass("glowmore");
	$("#dateedit .dateplus").addClass("glowmore");
	$(".dedisplay").addClass("glowmore");
	$(".dedisplay").addClass("glowmore");
	$("#dateseparate").addClass("glowmore");
	$(".datetext").addClass("datetextactive");
	$(".pdisplay").addClass("datetextactive");
	$(".dateplus").addClass("pluson");
	reload_hue();
}

function close_dateedit() {
	$(".datecontainer").removeClass("glowmore");
	$("#dateedit .dateplus").removeClass("glowmore");
	$(".dedisplay").removeClass("glowmore");
	$("#dateseparate").removeClass("glowmore");
	$(".datetext").removeClass("datetextactive");
	$(".pdisplay").removeClass("datetextactive");
	$(".dateplus").removeClass("pluson");
	if (input_date()>new Date()) store.zero = false;
	if (is_dateinput_on) {
		is_dateinput_on = false;
		$("#dateinput").addClass("transparent");
	}
	reload_hue();
}

$("#datezero").on("click",function() {
	if (!is_editing_date) return;
	store.zero=true;
	store.target=new Date();
	anim_vnum(0,500);
	$(".dzdisplay").addClass("glowmore");
	$(".zero").addClass("glowmore");
	reload_date();

	window.setTimeout(function() {
		$(".dzdisplay").removeClass("glowmore");
		$(".zero").removeClass("glowmore");
	},500);
});


document.addEventListener("keydown",function(event) {
	if (is_editing_date && (event.key=='ArrowUp' || event.key=='ArrowDown')) {
		modify_date(event.key=='ArrowUp');
	}
});

function modify_date(isUp) {
	let now = new Date();
	if ($("#dyear").is(':hover')) {
		if (isUp) {
			if (until(input_date(1,0,0,0,0))>=ringcap()) return;
			$("#dyear").text(Number.parseInt($("#dyear").text())+1);
		} else {
			if (until(input_date(-1,0,0,0,0))<0) return;
			$("#dyear").text(Number.parseInt($("#dyear").text())-1);
		}
	} else if ($("#dmonth").is(':hover')) {
		if (isUp) {
			if (until(input_date(0,1,0,0,0))>=ringcap()) return;
			$("#dmonth").text(Number.parseInt($("#dmonth").text())+1);
		} else {
			if (until(input_date(0,-1,0,0,0))<0) return;
			$("#dmonth").text(Number.parseInt($("#dmonth").text())-1);
		}
		if ($("#dday").text()>month_length(now.getFullYear(),$("#dmonth").text())) $("#dday").text(month_length(now.getFullYear(),$("#dmonth").text()));
	} else if ($("#dday").is(':hover')) {
		if (isUp) {
			if (until(input_date(0,0,1,0,0))>=ringcap()) return;
			$("#dday").text(Number.parseInt($("#dday").text())+1);
		} else {
			if (until(input_date(0,0,-1,0,0))<0) return;
			$("#dday").text(Number.parseInt($("#dday").text())-1);
		}
	} else if ($("#dhour").is(':hover')) {
		if (isUp) {
			if (until(input_date(0,0,0,1,0))>=ringcap()) return;
			$("#dhour").text(Number.parseInt($("#dhour").text())+1);
		} else {
			if (until(input_date(0,0,0,-1,0))<0) return;
			$("#dhour").text(Number.parseInt($("#dhour").text())-1);
		}
	} else if ($("#dmin").is(':hover')) {
		if (isUp) {
			if (until(input_date(0,0,0,0,1))>=ringcap()) return;
			$("#dmin").text(Number.parseInt($("#dmin").text())+1);
		} else {
			if (until(input_date(0,0,0,0,-1))<0) return;
			$("#dmin").text(Number.parseInt($("#dmin").text())-1);
		}
	} else if ($("#play").is(':hover')) {
		modify_ringnum(isUp);
	}
	store.target=input_date();
	store.zero = (store.target<=now);
	if (!store.zero) anim_vnum(until(input_date()),500);
	reload_date();
	reload_hue();
}

function input_date(ytweak,mtweak,dtweak,htweak,mintweak) {
	if (ytweak==undefined) {
		ytweak = mtweak = dtweak = htweak = mintweak = 0;
	}
	let date=Number.parseInt($("#dday").text());
	if (date<=month_length($("#dyear").text(),$("#dmonth").text())&&date>month_length($("#dyear").text()+ytweak,$("#dmonth").text()+mtweak)) date=month_length($("#dyear").text()+ytweak,$("#dmonth").text()+mtweak);
	return new Date(Number.parseInt($("#dyear").text())+ytweak,Number.parseInt($("#dmonth").text())-1+mtweak,date+dtweak,Number.parseInt($("#dhour").text())+htweak,Number.parseInt($("#dmin").text())+mintweak,0);
}

function month_length(year,month) {
	month=Number.parseInt(month);
	switch (month) {
		case 1: case 3: case 5: case 7:
		case 8: case 10: case 12:
			return 31;
		case 4: case 6: case 9: case 11:
			return 30;
		case 2:
			return 28+(year%4==0&&(year%100!=0||year%400==0));
	}
}


var is_dateinput_on = false;
$("#dyear").on("click",function() {
	if (!is_dateinput_on) {
		if (!is_editing_date) return;
		is_dateinput_on=true;
		$("#dateinput").removeClass("transparent");
	} else {
		let cursec=until(new Date($("#dateinput").val()));
		if (cursec>ringcap()) return;
		if (cursec<=0) {
			store.zero = true;
			store.target = new Date();
		} else {
			store.zero = false;
			store.target=new Date($("#dateinput").val());
		}
		is_dateinput_on=false;
		$("#dateinput").addClass("transparent");
		reload_date();
		save();
	}
});


function ringcap() {
	return Math.pow(10,9-store.ring);
}

function modify_ringnum(isUp) {
	if (isUp) {
		if (store.ring==0) return;
		store.ring--;
	} else {
		if (store.ring==7) return;
		if (until(input_date())>ringcap()/10) return;
		store.ring++;
	}
	reload_ringnum();
}


$("#play").on("click",function() {
	if (store.running) {
		suspend_timer();
		save();
		return;
	}
	if (is_editing_name || !is_editing_date || store.zero) return;
	store.target = input_date();
	store.running = true;
	save();
	start_timer();
});

var is_actually_running=false;
function start_timer() {
	is_editing_date = false;
	close_dateedit();

	$(".pdisplay").removeClass("datetextactive").addClass("glowmore");
	$(".playline").removeClass("transparent").addClass("glowmore");
	$(".nedisplay, #nameedit, .dedisplay, #dateedit, .dzdisplay, #datezero, #nidisplay").addClass("hidden");
	$(".ringnum").addClass("transparent");
	$(".datecontainer").addClass("shrunk");
	$(".glowring").css("animation", "0.5s forwards expand").removeClass("retracted");
	
	window.setTimeout(function() {
		time=Math.floor(until(input_date(),true)-1.5);
		for (let i=store.ring; i<=8; i++) {
			let curRot=get_angle(time,i);
			rotation[i]=curRot;
			$(`#r${i}`).attr("angle",`${curRot}`);
			$(`#r${i}`).css("animation", `1s cubic-bezier(.3,0,.5,1.75) forwards rotate${curRot}`);
		}
	},510);
	window.setTimeout(function() {
		if (!store.running) return;
		set_huetrans(false);
		is_actually_running=true;
	},1500);
}

function suspend_timer() {
	store.running = false;
	is_actually_running = false;

	$(".pdisplay").removeClass("glowmore");
	$(".playline").removeClass("glowmore");
	$(".playline").addClass("transparent");
	$(".nedisplay, #nameedit, .dedisplay, #dateedit, .dzdisplay, #datezero, #nidisplay").removeClass("hidden");
	$(".ringnum").removeClass("transparent");
	$(".datecontainer").removeClass("shrunk");
	$(".glowring").removeClass("rotate0").removeClass("rotate36").removeClass("rotate72").removeClass("rotate108").removeClass("rotate144").removeClass("rotate180").removeClass("rotate216").removeClass("rotate252").removeClass("rotate288").removeClass("rotate324").each(function() {
		$(this).addClass(`rotate${$(this).attr("angle")}`);
	});
	$(".glowring").css("animation", "0.5s forwards retract").addClass("retracted");
	
	set_huetrans(true);
	if (!store.zero) anim_vnum(until(input_date()),500);
	window.setTimeout(open_dateedit,10);
	is_editing_date=true;
	window.setTimeout(function() {
		if (store.running) return;
	}, 500);
}

function redirect() {
	window.clearInterval(KILLCODE);
	is_actually_running = false;
	store.running = false;
	store.link = "";
	save();

	set_huetrans(true);
	$(".glowring").addClass("glowmore");
	set_var("--theme-hue","140");
	set_icon("_redirect");
	$(".blind").removeClass("hidden");

	window.setTimeout(function() {
		$(".blind").removeClass("transparent");
	},1500);

	window.setTimeout(function() {
		window.location.href = $("#linkinput").val();
	},6000);
}

function until(date,millisecond) {
	let now = new Date();
	if (!millisecond) return Math.floor((date - now) / 1000);
	return (date - now) / 1000;
}

function get_angle(second,ringnum) {
	let sleft=second;
	sleft=Math.floor(sleft/Math.pow(10,8-ringnum));
	sleft=(sleft)%10*36;
	return sleft;
}

function percent() {
	if (store.ring==0) {
		return `${(100-get_rnum()/ringcap()*100).toFixed(6)}%`;
	} else if (store.ring<4) {
		return `${(100-get_rnum()/ringcap()*100).toFixed(7-store.ring)}%`;
	} else {
		return `${(100-get_rnum()/ringcap()*100).toFixed(3)}%`;
	}
}

const tick_length = 49;
const reload_time_ticks = 1;
const reload_hue_ticks = 20;
var since_reload_time = reload_time_ticks-1;
var since_reload_hue = reload_hue_ticks-1;
function tick() {
	since_reload_time++;
	since_reload_hue++;
	if (since_reload_time>=reload_time_ticks) {
		since_reload_time=0;
		reload_time();
	}
	if (since_reload_hue>=reload_hue_ticks) {
		since_reload_hue=0;
		reload_hue();
	}
}

var hue=-1;
function reload_hue() {
	if (is_editing_date&&store.zero) {
		if (hue==140) return;
		set_var("--theme-hue","140");
		hue=140;
		set_icon("_zero");
		return;
	}
	if (is_editing_date||store.running) {
		set_icon("_timer");
		var n_hue=get_rnum()/ringcap();
		n_hue=Math.floor(n_hue*180+150);
		if (hue==n_hue) return;
		hue=n_hue;
		set_var("--theme-hue",hue);
		return;
	}
	if (hue==345) return;
	reset_var("--theme-hue");
	hue=345;
	set_icon("_notimer");
}

var time=-1;
var rotation=[-1,-1,-1,-1,-1,-1,-1,-1,-1];
function reload_time() {
	let now = new Date();
	if (store.zero) {
		store.target=now;
		reload_date();
	}
	if (is_editing_date) {
		store.zero = (input_date()<=now);
	}  else if (is_actually_running) {
		if (input_date()<=now) {
			store.running=false;
			store.zero=true;
			save();
			if (store.link!="") {
				redirect();
			} else {
				suspend_timer();
			}
			return;
		}
		if (until(input_date(),true)-0.5 < time) {
			time=Math.floor(until(input_date(),true)-0.5);
			if (store.link!="" && time<0) {
				$("#r1, #r3, #r5, #r7").css("animation","1s cubic-bezier(1,0,.8,.25) forwards finalspin-odd");
				$("#r0, #r2, #r4, #r6, #r8").css("animation","1s cubic-bezier(1,0,.8,.25) forwards finalspin-even");
			} else {
				for (var i=store.ring; i<=8; i++) {
					var curRot=get_angle(time,i);
					if (rotation[i]==curRot) continue;
					rotation[i]=curRot;
					$(`#r${i}`).css("animation",`0.5s cubic-bezier(1,0,.8,.25) forwards rotate${curRot}`);
					$(`#r${i}`).attr("angle",`${curRot}`);
				}
			}
		}
	}
	if (!in_animation&&(store.running||(is_editing_date&&!store.zero))) {
		set_vnum(until(input_date()));
		set_rnum(until(input_date()));
	}
	if (!store.running) {
		set_title(store.name);
	}
}

$(".glowring").on("animationend", function(event) {
	if (event.animationName=="retract" || event.animationName=="expand") return;
	$(this).removeClass("rotate0").removeClass("rotate36").removeClass("rotate72").removeClass("rotate108").removeClass("rotate144").removeClass("rotate180").removeClass("rotate216").removeClass("rotate252").removeClass("rotate288").removeClass("rotate324");
	$(this).addClass(`rotate${$(this).attr("angle")}`);
	if ($(this).is("#r8")) set_title(`${store.name}: ${percent()}`);
})


var KILLCODE=0;
window.onload = function() {
	console.log("loading...");
	KILLCODE = window.setInterval(tick,tick_length);
	window.setTimeout(load,10);
}

window.onbeforeunload = function() {
	window.clearInterval(KILLCODE);
	save();
	console.log("quitting...");
}