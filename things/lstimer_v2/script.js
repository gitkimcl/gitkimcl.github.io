var now = new Date();

const SAFETYPIN = false;
// RESET, SAVE & LOAD
function reset() {
	// debug mode only
	console.log("resetting");
	window.location.reload();
}

var store_targetDate;
var store_dateZero;
var store_timerRunning;
var store_timerName;
var store_timerLink;
var store_ringStart;
function _savepart(obj,name) {
	if (obj == undefined) return 28;
	console.log(name+" saved: "+obj);
	localStorage.setItem(name,obj.toString());
	return 8;
}

function _save() {
	var sum=0;
	if (store_targetDate==undefined) {
		store_targetDate=new Date();
		store_dateZero=true;
		localStorage.setItem("targetDate","zero");
		_reload("date");
		sum+=16;
	} else if (store_targetDate<new Date()) {
		store_targetDate=new Date();
		store_dateZero=true;
		localStorage.setItem("targetDate","zero");
		_reload("date");
		sum+=16;
	} else {
		sum+=_savepart(store_targetDate,"targetDate");
		store_dateZero = false;
		sum+=8;
	}
	if (store_dateZero) {
		setNumber(0);
		_setRealNumber(0);
	}
	if (store_timerRunning) {
		localStorage.setItem("timerRunning","true");
		console.log("timerRunning saved: true");
	} else {
		localStorage.setItem("timerRunning",null);
		console.log("timerRunning saved: false");
	}
	sum+=8;
	sum+=_savepart(store_timerName,"timerName");
	sum+=_savepart(store_timerLink,"timerLink");
	sum+=_savepart(store_ringStart,"ringStart");
	return sum;
}

function _load() {
	if (!SAFETYPIN) console.log("---SAFETY PIN IS DETACHED");
	if (localStorage.getItem("targetDate")!=null) {
		if (localStorage.getItem("targetDate")=="zero") {
			store_targetDate=new Date();
			store_dateZero=true;
		} else {
			store_targetDate=new Date(localStorage.getItem("targetDate"));
		}
	} else {
		store_targetDate=new Date();
		store_dateZero=true;
		localStorage.setItem("targetDate","zero");
	}
	if (store_targetDate<new Date()) {
		store_targetDate=new Date();
		store_dateZero=true;
		localStorage.setItem("targetDate","zero");
	}
	_reload("date");
	if (localStorage.getItem("timerRunning")=="true") {
		store_timerRunning=true;
	} else {
		store_timerRunning=false;
	}
	if (store_timerRunning) {
		_runTimerAnimation();
	}
	if (localStorage.getItem("timerName")==null) localStorage.setItem("timerName","");
	if (localStorage.getItem("timerLink")==null) localStorage.setItem("timerLink","");
	if (localStorage.getItem("ringStart")==null) localStorage.setItem("ringStart","1");
	store_timerName=localStorage.getItem("timerName");
	store_timerLink=localStorage.getItem("timerLink");
	store_ringStart=parseInt(localStorage.getItem("ringStart"));
	_reload("namelink");
	_reload("ring");
}

function _reload(instruct) {
	if (instruct=="namelink") {
		if (store_timerName!=undefined) $("#nameinput").val(store_timerName);
		if (store_timerLink!=undefined) $("#linkinput").val(store_timerLink);
		_setTitle(store_timerName);
	} else if (instruct=="date") {
		if (store_targetDate==undefined) return;
		$("#dyear").text(store_targetDate.getYear()+1900);
		$("#dmonth").text(store_targetDate.getMonth()+1);
		$("#dday").text(store_targetDate.getDate());
		$("#dhour").text(store_targetDate.getHours());
		$("#dmin").text(store_targetDate.getMinutes());
		$("#dateinput").val(new Date(_getDateFromInput(0,0,0,0,0).valueOf()-new Date().getTimezoneOffset() * 60000).toISOString().substring(0,16));
	} else if (instruct=="ring") {
		_updateRing();
	}
}

function _clear() {
	localStorage.clear();
}

// CSS VARIABLES
function _getVar(name) {
	return getComputedStyle(document.getElementById("var")).getPropertyValue(name);
}

function _setVar(name,value) {
	document.getElementById("var").style.setProperty(name,value);
}

var hueTransState = true;
function _changeHueTransState(val) {
	if (hueTransState==val) return;
	hueTransState=val;
	if (hueTransState) {
		_setVar("--default-trans","background-color 0.5s linear, color 0.5s linear, border 0.5s linear, border-color 0.5s linear, box-shadow 0.5s linear, text-shadow 0.5s linear");
	} else {
		_setVar("--default-trans","none");
	}
}
//ICON & TITLE
var icon = "";
function _setIcon(name) {
	if (name==icon) return;
	icon=name;
	$("#fav").attr("href","icon/ring"+name+".ico");
}

var title="loading";
function _setTitle(name) {
	if (name==title) return;
	title=name;
	$("#title").text(name);
}

// TICK & INTERVAL FUNCTIONS
const tickLength = 19;
const timeChangeInterval = 1;
const hueChangeInterval = 20;
var tsTimeChange = timeChangeInterval-1;
var tsHueChange = hueChangeInterval-1;
function tick() {
	if (!SAFETYPIN&&RAINBOWFLAG) _rainbowMode();
	tsTimeChange++;
	tsHueChange++;
	var daytime = now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
	if (daytime>43200) {
		daytime=86400-daytime;
	}
	if (daytime>=21600&&lightFlag==false) {
		changeLight(true);
	} else if (daytime<21600&&lightFlag==true) {
		changeLight(false);
	}
	if (tsTimeChange>=timeChangeInterval) {
		changeTime();
	}
	if (tsHueChange>=hueChangeInterval) {
		changeHue();
	}
}

var CUSTOMIZECOLOR = false;
var lightFlag = false;
function changeLight(lf) {
	if (!SAFETYPIN&&CUSTOMIZECOLOR) return;
	if (lf) {
		_setVar("--theme-light","80%");
		lightFlag=true;
	} else {
		_setVar("--theme-light","20%");
		lightFlag=false;
	}
}

var prevHue=-1;
function changeHue() {
	tsHueChange=0;
	if (!SAFETYPIN&&(CUSTOMIZECOLOR||RAINBOWFLAG)) return;
	if (dateEditingFlag&&store_dateZero) {
		if (prevHue==210) return;
		_setVar("--theme-hue","210");
		prevHue=210;
		_setIcon("0");
		return;
	}
	if (store_timerRunning||(dateEditingFlag&&!store_dateZero)) {
		var hue=_getRealNumber()/_getRingCap();
		_setIcon(Math.floor(hue*8).toString());
		hue*=90;
		hue+=210;
		hue=Math.floor(hue);
		if (prevHue==hue) return;
		_setVar("--theme-hue",hue);
		prevHue=hue;
		return;
	}
	if (prevHue==330) return;
	_setVar("--theme-hue","330");
	prevHue=330;
	_setIcon("_notimer");
}

var CUSTOMIZEDATE=false;
var _prevSec=-1;
var _prevRot=[-1,0,0,0,0,0,0,0,0];
function changeTime() {
	tsTimeChange=0;
	if (SAFETYPIN || !CUSTOMIZEDATE) {
		now = new Date();
		if (!dateEditingFlag&&store_dateZero) {
			store_targetDate=now;
			_reload("date");
		}
	}
	if ((store_timerRunning||(dateEditingFlag&&!store_dateZero))&&!in_animation) {
		setNumber(_getSecLeft(_getDateFromInput(0,0,0,0,0)));
		_setRealNumber(_getSecLeft(_getDateFromInput(0,0,0,0,0)));
	}
	if (dateEditingFlag) {
		if (_getDateFromInput(0,0,0,0,0)>new Date()) store_dateZero = false;
		else store_dateZero = true;
	}  else if (timerActuallyRunning) {
		if (_getDateFromInput(0,0,0,0,0)<new Date()) {
			store_timerRunning=false;
			store_dateZero=true;
			_save();
			if (store_timerLink!="") {
				_timerEnd();
			} else {
				_timerSuspend();
			}
			return;
		}
		if (_getSecLeft(_getDateFromInput(0,0,0,0,0),true)-0.5 < _prevSec) {
			_prevSec=Math.floor(_getSecLeft(_getDateFromInput(0,0,0,0,0),true)-0.5);
			for (var i=store_ringStart; i<=8; i++) {
				var curRot=_getRotation(_prevSec,i);
				if (_prevRot[i]==curRot) continue;
				if (curRot==315) _tempRelease(i,curRot);
				_prevRot[i]=curRot;
				$("#r"+i).css("transform","var(--trans-center) rotate("+_prevRot[i]+"deg)");
				if (_prevSec%Math.pow(8,8-i)==0) break;
			}
		}
		if (_getSecLeft(_getDateFromInput(0,0,0,0,0),true)-1 < _prevSec) {
			_setTitle(store_timerName+": "+_getPercent());
		}
	}
	if (!store_timerRunning) {
		_setTitle(store_timerName);
	}
}

var RAINBOWFLAG=false;
function _rainbowMode() {
	// WARNING: severe lag
	_changeHueTransState(false);
	_setVar("--theme-hue",Number.parseInt(_getVar("--theme-hue"))+1);
}

// NUMBER MODIFIER FUNCTIONS
var digits=[-1,0,0,0,0,0,0,0,0]; // digits[0] : unused
var visualdigits=[-1,0,0,0,0,0,0,0,0]; // visualdigits[0] : unused
function _getNumber() {
	var result=0;
	for (var i=1; i<=8; i++) {
		result*=10;
		result+=visualdigits[i];
	}
	return result;
}

function _getRealNumber() {
	var result=0;
	for (var i=1; i<=8; i++) {
		result*=10;
		result+=digits[i];
	}
	return result;
}

function _setDigitAnim(dnum,val,code) {
	if (cur_animation != code) return;
	if (!(1<=dnum<=8));
	$(".d"+dnum).text(val);
	visualdigits[dnum]=val;
}

function _setDigit(dnum,val) {
	if (!(1<=dnum<=8));
	$(".d"+dnum).text(val);
	visualdigits[dnum]=val;
}
 
function setNumber(num) {
	if (!Number.isInteger(num)) return 48;
	if (num<0) return 28;
	
	for (var i=8; i>=1; i--) {
		_setDigit(i,num%10);
		num=Math.floor(num/10);
	}
	return 8;
}

function _setRealNumber(num) {
	if (!Number.isInteger(num)) return 48;
	if (num<0) return 28;
	
	for (var i=8; i>=1; i--) {
		_setRealDigit(i,num%10);
		num=Math.floor(num/10);
	}
	return 8;
}

function _setRealDigit(dnum,val) {
	digits[dnum]=val;
}

var in_animation = false;
var cur_animation = 0;
function setNumberAnimation(num,duration) {
	in_animation = true;
	cur_animation++;
	var isUp = _getRealNumber()<num;
	_setRealNumber(num);
	window.setTimeout(endAnimation,duration+10,cur_animation);
	if (!(typeof isUp == "boolean")) return 48;
	if (!Number.isInteger(num)) return 48;
	if (!Number.isInteger(duration)) return 48;
	if (num<0) return 28;
	if (duration<10) return 28;
	
	var cur, steps, point;
	for (var i=8; i>=1; i--) {
		cur=num%10;
		num=Math.floor(num/10);
		if (isUp) {
			point=visualdigits[i];
			steps=(cur-point+10)%10;
			for (var j=0; j<steps; j++) {
				point++;
				point%=10;
				window.setTimeout(_setDigitAnim,duration/steps*j,i,point,cur_animation);
			}
		} else {
			steps=(visualdigits[i]-cur+10)%10;
			point=visualdigits[i];
			for (var j=0; j<steps; j++) {
				point--;
				if (point<0) point+=10;
				window.setTimeout(_setDigitAnim,duration/steps*j,i,point,cur_animation);
			}
		}
	}
}

function endAnimation(code) {
	if (cur_animation != code) return;
	in_animation = false;
	setNumber(_getSecLeft(0,0,0,0,0));
}

// NAME & LINK EDITING STATE TOGGLER FUNCTIONS
var nameEditingFlag = false;
const DEBUGMODE = true;
function nameEditToggle() {
	if (store_timerRunning) return;
	if (nameEditingFlag) {
		window.setTimeout(_liclose,10);
		nameEditingFlag=false;
		if (!SAFETYPIN&&DEBUGMODE&&$("#nameinput").val()=="EXECUTE") {
			console.log("!!DEBUG MODE!!");
			console.log("reloading and executing");
			try {
				eval($("#linkinput").val());
			} catch (err) {
				console.log(err.message);
			}
			_reload("namelink");
			return;
		}
		store_timerName=$("#nameinput").val();
		store_timerLink=$("#linkinput").val();
		_save();
	} else {
		if (dateEditingFlag) return;
		$("#lidisplay").css("display","flex");
		$("#linkinput").css("display","inline-block");
		window.setTimeout(_liopen,10);
		nameEditingFlag=true;
	}
}

function _liopen() {
	window.clearInterval(_closeKillcode);
	$("#nameinput").prop("readonly",false);
	$("#linkinput").prop("readonly",false);
	$("#nameedit .editmark").addClass("glowmore");
	$(".nedisplay").addClass("glowmore");
	$("#inputs .glowborder").addClass("glowmore");
	$("#inputs input").css("color","var(--theme-glow3)");
	$("#inputs input").addClass("glowplaceholder");
	$(".ligroup").addClass("liopen");
	$(".em1").css("transform","translate(-50%,-50%) rotate(45deg)");
	$(".em2").css("transform","translate(-50%,-50%) rotate(135deg)");
}

var _closeKillcode;
function _liclose() {
	window.clearInterval(_closeKillcode);
	$("#nameinput").prop("readonly",true);
	$("#linkinput").prop("readonly",true);
	$("#nameedit .editmark").removeClass("glowmore");
	$(".nedisplay").removeClass("glowmore");
	$("#inputs .glowborder").removeClass("glowmore");
	$("#inputs input").css("color","var(--theme-text)");
	$("#inputs input").removeClass("glowplaceholder");
	$(".ligroup").removeClass("liopen");
	$(".em1").css("transform","translate(-50%,-50%) rotate(0deg)");
	$(".em2").css("transform","translate(-50%,-50%) rotate(90deg)");
	_closeKillcode=window.setTimeout(_closegrp,1010);
}

function _closegrp() {
	$(".ligroup").css("display","none");
}
document.getElementById("nameedit").addEventListener("click",nameEditToggle);

// DATE EDITING STATE TOGGLER FUNCTIONS
var dateEditingFlag=false;
function dateEditToggle() {
	if (store_timerRunning) return;
	if (dateEditingFlag) {
		window.setTimeout(_declose,10);
		window.setTimeout(_save,12);
		store_targetDate = _getDateFromInput(0,0,0,0,0);
		setNumberAnimation(0,500);
		dateEditingFlag=false;
	} else {
		if (nameEditingFlag) return;
		setNumberAnimation(_getSecLeft(_getDateFromInput(0,0,0,0,0)),500);
		window.setTimeout(_deopen,10);
		dateEditingFlag=true;
	}
}
document.getElementById("dateedit").addEventListener("click",dateEditToggle);

function _getDateFromInput(ytweak,mtweak,dtweak,htweak,mintweak) {
	var date=Number.parseInt($("#dday").text());
	if (date<=_dayOfMonth($("#dyear").text(),$("#dmonth").text())&&date>_dayOfMonth($("#dyear").text()+ytweak,$("#dmonth").text()+mtweak)) date=_dayOfMonth($("#dyear").text()+ytweak,$("#dmonth").text()+mtweak);
	return new Date(Number.parseInt($("#dyear").text())+ytweak,Number.parseInt($("#dmonth").text())-1+mtweak,date+dtweak,Number.parseInt($("#dhour").text())+htweak,Number.parseInt($("#dmin").text())+mintweak,0);
}

function _deopen() {
	$(".datecontainer").addClass("glowmore");
	$("#dateedit .deditmark").addClass("glowmore");
	$(".dedisplay").addClass("glowmore");
	$(".dedisplay").addClass("glowmore");
	$("#dateseparate").addClass("glowmore");
	$(".datetext").addClass("datetextactive");
	$(".pdisplay").addClass("datetextactive");
	$(".dem1").css("transform","translate(-50%,-50%) rotate(45deg)");
	$(".dem2").css("transform","translate(-50%,-50%) rotate(135deg)");
}

function _declose() {
	$(".datecontainer").removeClass("glowmore");
	$("#dateedit .deditmark").removeClass("glowmore");
	$(".dedisplay").removeClass("glowmore");
	$("#dateseparate").removeClass("glowmore");
	$(".datetext").removeClass("datetextactive");
	$(".pdisplay").removeClass("datetextactive");
	$(".dem1").css("transform","translate(-50%,-50%)");
	$(".dem2").css("transform","translate(-50%,-50%) rotate(90deg)");
	if (_getDateFromInput(0,0,0,0,0)>new Date()) store_dateZero = false;
	if (dateInputOn) {
		dateInputOn = false;
		$("#dateinput").css("opacity","0%");
	}
}

function dateZero() {
	if (dateEditingFlag) {
		store_dateZero=true;
		store_targetDate=new Date();
		setNumberAnimation(0,500);
		$(".dzdisplay").addClass("glowmore");
		$(".zero").addClass("glowmore");
		window.setTimeout(_zeroShineEnd,500);
		_reload("date");
	}
}
document.getElementById("datezero").addEventListener("click",dateZero);

function _zeroShineEnd() {
	$(".dzdisplay").removeClass("glowmore");
	$(".zero").removeClass("glowmore");
}

// DATE MODIFIER FUNCTIONS
function _onKeyPress(event) {
	if (event.keyCode==38 || event.keyCode==40) {
		_modifyDate(event.keyCode==38);
	}
}
document.addEventListener("keydown",_onKeyPress);

function _modifyDate(isUp) {
	if (!dateEditingFlag) return;
	if (document.getElementById("dyear").matches(':hover')) {
		if (isUp) {
			if (!(0<=_getSecLeft(_getDateFromInput(1,0,0,0,0))&&_getSecLeft(_getDateFromInput(1,0,0,0,0))<=_getRingCap())) return;
			$("#dyear").text(Number.parseInt($("#dyear").text())+1);
		} else {
			if (!(0<=_getSecLeft(_getDateFromInput(-1,0,0,0,0))&&_getSecLeft(_getDateFromInput(-1,0,0,0,0))<=_getRingCap())) return;
			$("#dyear").text(Number.parseInt($("#dyear").text())-1);
		}
	} else if (document.getElementById("dmonth").matches(':hover')) {
		if (isUp) {
			if (!(0<=_getSecLeft(_getDateFromInput(0,1,0,0,0))&&_getSecLeft(_getDateFromInput(0,1,0,0,0))<=_getRingCap())) return;
			$("#dmonth").text(Number.parseInt($("#dmonth").text())+1);
		} else {
			if (!(0<=_getSecLeft(_getDateFromInput(0,-1,0,0,0))&&_getSecLeft(_getDateFromInput(0,-1,0,0,0))<=_getRingCap())) return;
			$("#dmonth").text(Number.parseInt($("#dmonth").text())-1);
		}
		if ($("#dday").text()>_dayOfMonth(now.getYear()+1900,$("#dmonth").text())) $("#dday").text(_dayOfMonth(now.getYear()+1900,$("#dmonth").text()));
	} else if (document.getElementById("dday").matches(':hover')) {
		if (isUp) {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,1,0,0))&&_getSecLeft(_getDateFromInput(0,0,1,0,0))<=_getRingCap())) return;
			$("#dday").text(Number.parseInt($("#dday").text())+1);
		} else {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,-1,0,0))&&_getSecLeft(_getDateFromInput(0,0,-1,0,0))<=_getRingCap())) return;
			$("#dday").text(Number.parseInt($("#dday").text())-1);
		}
	} else if (document.getElementById("dhour").matches(':hover')) {
		if (isUp) {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,0,1,0))&&_getSecLeft(_getDateFromInput(0,0,0,1,0))<=_getRingCap())) return;
			$("#dhour").text(Number.parseInt($("#dhour").text())+1);
		} else {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,0,-1,0))&&_getSecLeft(_getDateFromInput(0,0,0,-1,0))<=_getRingCap())) return;
			$("#dhour").text(Number.parseInt($("#dhour").text())-1);
		}
	} else if (document.getElementById("dmin").matches(':hover')) {
		if (isUp) {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,0,0,1))&&_getSecLeft(_getDateFromInput(0,0,0,0,1))<=_getRingCap())) return;
			$("#dmin").text(Number.parseInt($("#dmin").text())+1);
		} else {
			if (!(0<=_getSecLeft(_getDateFromInput(0,0,0,0,-1))&&_getSecLeft(_getDateFromInput(0,0,0,0,-1))<=_getRingCap())) return;
			$("#dmin").text(Number.parseInt($("#dmin").text())-1);
		}
	} else if (document.getElementById("play").matches(':hover')) {
		_modifyRingnum(isUp);
	}
	setNumberAnimation(_getSecLeft(_getDateFromInput(0,0,0,0,0)),500);
	store_targetDate=_getDateFromInput(0,0,0,0,0);
	_reload("date");
}

function _dayOfMonth(year,month) {
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

function _getSecLeft(date) {
	return Math.floor((date - now) / 1000);
}

function _getSecLeft(date,millisecond) {
	if (!millisecond) return Math.floor((date - now) / 1000);
	return (date - now) / 1000;
}

// DATETIME INPUT MENU FOR ACCESSIBILITY
var dateInputOn = false;
function dateInputToggle() {
	if (!dateInputOn) {
		if (!dateEditingFlag) return;
		dateInputOn=true;
		$("#dateinput").css("opacity","100%");
	} else {
		var cursec=_getSecLeft(new Date($("#dateinput").val()));
		if (!(0<cursec&&cursec<=_getRingCap())) return;
		dateInputOn=false;
		$("#dateinput").css("opacity","0%");
		store_targetDate=new Date($("#dateinput").val());
		_reload("date");
		_save();
	}
}
document.getElementById("dyear").addEventListener("click",dateInputToggle);

// FUNCTIONS ABOUT ADJUSTING RING NUMBER
function _getRingCap() {
	return Math.min(99999999,Math.pow(8,9-store_ringStart));
}

function _updateRing() {
	for (var i=0; i<=8; i++) {
		if (i<store_ringStart) {
			$("#r"+i).css("opacity","0%");
		} else {
			$("#r"+i).css("opacity","100%");
		}
	}
	$(".ringnum").text(9-store_ringStart);
}

function _modifyRingnum(isUp) {
	if (isUp) {
		if (store_ringStart==0) return;
		store_ringStart--;
	} else {
		if (store_ringStart==6) return;
		if (_getSecLeft(_getDateFromInput(0,0,0,0,0))>Math.pow(8,8-store_ringStart)) return;
		store_ringStart++;
	}
	_updateRing();
}

// FUNCTIONS ABOUT EXECUTING TIMER
function runTimer() {
	if (!store_timerRunning) {
		if (nameEditingFlag || !dateEditingFlag) return;
		if (store_dateZero) return;
		window.setTimeout(_runTimerAnimation,10);
		store_targetDate = _getDateFromInput(0,0,0,0,0);
		store_timerRunning = true;
		_save();
	} else {
		_timerSuspend();
		store_timerRunning = false;
		_save();
	}
}
document.getElementById("play").addEventListener("click",runTimer);

function _runTimerAnimation() {
	if (dateEditingFlag) {
		dateEditingFlag=false;
	}
	$(".glowring").removeClass("retracted");
	$(".glowring").css("transition","width 0.5s, height 0.5s, left 0.5s, top 0.5s, transform 0.5s ease-in");
	$(".pdisplay").removeClass("datetextactive");
	$(".pdisplay").addClass("glowmore");
	_declose();
	$(".datecontainer").css("width","calc(38.55 * var(--size-default1))");
	$(".nedisplay, #nameedit, .dedisplay, #dateedit, .dzdisplay, #datezero, #nidisplay").css("display","none");
	$(".ringnum").css("opacity","0%");
	$(".playline").addClass("glowmore");
	$(".playline").css("opacity","100%");
	waitPrevSec=_getSecLeft(_getDateFromInput(0,0,0,0,0));
	window.setTimeout(_doublewait,1000);
}

function _doublewait() {
	timerInitKillcode=window.setInterval(_waitForInit,9);
}

var timerInitKillcode=-1;
var waitPrevSec;
function _waitForInit() {
	if (_getSecLeft(_getDateFromInput(0,0,0,0,0))!=waitPrevSec) {
		window.clearInterval(timerInitKillcode);
		_initialTimerAnimation();
	}
}
var timerActuallyRunning=false;
function _initialTimerAnimation() {
	$(".glowring").css("transition","width 0.5s, height 0.5s, left 0.5s, top 0.5s, transform 1.5s cubic-bezier(.47,0,.58,1.48)");
	var second=_getSecLeft(_getDateFromInput(0,0,0,0,0))-2;
	for (var i=store_ringStart; i<=8; i++) {
		_prevRot[i]=_getRotation(second,i);
		$("#r"+i).css("transform","var(--trans-center) rotate("+_prevRot[i]+"deg)");
	}
	window.setTimeout(_startTimer,2000);
}

function _startTimer() {
	if (!store_timerRunning) return;
	_prevSec=_getSecLeft(_getDateFromInput(0,0,0,0,0));
	$(".glowring").css("transition","border-color 0.5s, box-shadow 0.5s, transform 0.5s ease-in");
	if (store_timerRunning) timerActuallyRunning=true;
	_changeHueTransState(false);
}

function _getRotation(second,ringnum) {
	var sleft=second;
	sleft=Math.floor(sleft/Math.pow(8,8-ringnum));
	sleft=(sleft+1)%8*45;
	return sleft;
}

function _tempRelease(ringnum) {
	$("#r"+ringnum).css("transition","none");
	$("#r"+ringnum).css("transform","var(--trans-center) rotate(360deg)");
	$("#r"+ringnum)[0].offsetHeight; // reflow라나 뭐라나 아무튼 이렇게 해야 transition이 안됨
	$("#r"+ringnum).css("transition","border-color 0.5s, box-shadow 0.5s, transform 0.5s ease-in");
}

function _timerSuspend() {
	store_timerRunning = false;
	timerActuallyRunning = false;
	console.log("_timerSuspend");
	$(".glowring").css("transition","width 0.5s, height 0.5s, left 0.5s, top 0.5s, transform 0.5s ease-in");
	$(".glowring").addClass("retracted");
	$(".pdisplay").removeClass("glowmore");
	$(".datecontainer").css("width","calc(49 * var(--size-default1))");
	$(".nedisplay, #nameedit, .dedisplay, #dateedit, .dzdisplay, #datezero, #nidisplay").css("display","inline-block");
	$(".nigroup").css("border","");
	$(".ringnum").css("opacity","100%");
	$(".playline").removeClass("glowmore");
	$(".playline").css("opacity","0%");
	_changeHueTransState(true);
	dateEditingFlag=false;
	dateEditToggle();
	window.setTimeout(_remove_ring_trans, 500);
}

function _remove_ring_trans() {
	if (store_timerRunning) return;
	$(".glowring").css("transition","opacity 0.5s");
}

function _timerEnd() {
	store_timerRunning = false;
	store_timerLink = "";
	_save();
	timerActuallyRunning = false;
	window.setTimeout(_endSeqA,10);
	window.setTimeout(_endSeqB,1510);
	window.setTimeout(_endSeqC,6010);
}

function _endSeqA() {
	CUSTOMIZECOLOR = true;
	_changeHueTransState(true);
	$(".glowring").addClass("glowmore");
	_setVar("--theme-hue","180");
	_setIcon("_redirect");
	$(".blind").css("display","block");
}

function _endSeqB() {
	$(".blind").css("opacity","100%");
}

function _endSeqC() {
	window.location.href = $("#linkinput").val();
}

function _getPercent() {
	if (store_ringStart==0) {
		return (100-_getRealNumber()/_getRingCap()*100).toFixed(6)+"%";
	} else if (store_ringStart<4) {
		return (100-_getRealNumber()/_getRingCap()*100).toFixed(7-store_ringStart)+"%";
	} else {
		return (100-_getRealNumber()/_getRingCap()*100).toFixed(3)+"%";
	}
}

var KILLCODE=0;
window.onload = function() {
	console.log("loading...");
	KILLCODE = window.setInterval(tick,tickLength);
	window.setTimeout(_load,10);
}

window.onbeforeunload = function() {
	window.clearInterval(KILLCODE);
	console.log("outting...");
}