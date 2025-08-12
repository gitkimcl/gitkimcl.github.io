function updateRGB(e) {
	var rgb=document.getElementById("col").value;
	var r=Number("0x"+rgb.substring(1,3));
	var g=Number("0x"+rgb.substring(3,5));
	var b=Number("0x"+rgb.substring(5));
	document.getElementById("red").value=r;
	document.getElementById("green").value=g;
	document.getElementById("blue").value=b;
	updateColorCode();
	updateBG(r,g,b);
}

function updateColor(e) {
	var r = Number(document.getElementById("red").value);
	var g = Number(document.getElementById("green").value);
	var b = Number(document.getElementById("blue").value);
	var a = Number(document.getElementById("alpha").value);
	if (!(0<=r&&r<=255)) {
		document.getElementById("red").value=0;
		r=0;
	}
	if (!(0<=g&&g<=255)) {
		document.getElementById("green").value=0;
		g=0;
	}
	if (!(0<=b&&b<=255)) {
		document.getElementById("blue").value=0;
		b=0;
	}
	if (!(0<=a&&a<=255)) {
		document.getElementById("alpha").value=0;
		a=0;
	}
	var rgb = '#'+dig2(r.toString(16))+dig2(g.toString(16))+dig2(b.toString(16));
	document.getElementById("col").value=rgb;
	updateColorCode();
	updateBG(r,g,b);
}

function updateColorCode(e) {
	var r = Number(document.getElementById("red").value);
	var g = Number(document.getElementById("green").value);
	var b = Number(document.getElementById("blue").value);
	var a = Number(document.getElementById("alpha").value);
	var cc=r*65536+g*256+b;
	document.getElementById("code").value=cc;
	var cca=(a*16777216+cc+2147483648)%4294967296-2147483648;
	document.getElementById("codealpha").value=cca;
}

function decodeColorCode(e) {
	var cc=document.getElementById("code").value;
	if (!(0<=cc&&cc<=16777215)) {
		document.getElementById("code").value=0;
		cc=0;
	}
	var b=cc%256;
	cc=Math.floor(cc/256);
	var g=cc%256;
	cc=Math.floor(cc/256);
	var r=cc;
	var a=255;
	document.getElementById("red").value=r;
	document.getElementById("green").value=g;
	document.getElementById("blue").value=b;
	document.getElementById("alpha").value=255;
	document.getElementById("code").value=-16777216+r*65536+g*256+b;
	updateColor();
}

function decodeColorCodeA(e) {
	var cca=Number(document.getElementById("codealpha").value);
	if (2147483648<=cca&&cca<=4294967295) {
		cca -= 4294967296;
		document.getElementById("codealpha").value=cca;
	}
	if (!(-2147483648<=cca&&cca<=2147483647)) {
		document.getElementById("codealpha").value=0;
		cca=0;
	}
	cca += 4294967296;
	var b=cca%256;
	cca=Math.floor(cca/256);
	var g=cca%256;
	cca=Math.floor(cca/256);
	var r=cca%256;
	cca=Math.floor(cca/256);
	var a=cca%256;
	document.getElementById("red").value=r;
	document.getElementById("green").value=g;
	document.getElementById("blue").value=b;
	document.getElementById("alpha").value=a;
	document.getElementById("code").value=r*65536+g*256+b;
	updateColor();
}

function updateBG(r,g,b) {
	var bgcol="rgba("+r+","+g+","+b+",15%)";
	var border="rgba("+r+","+g+","+b+",85%)";
	document.getElementById("bg").style.backgroundColor=bgcol;
	document.getElementById("border").style.setProperty("--color",border);
	var inputs=document.getElementsByTagName("input");
	for (var idx=0; idx<inputs.length; idx++) {
		inputs[idx].style.setProperty("--color",border);
		inputs[idx].style.setProperty("--textcolor","rgba("+r*0.6+","+g*0.6+","+b*0.6+",85%)");
	}
	document.getElementById("col").style.backgroundColor="rgba("+r+","+g+","+b+",30%)";
	document.getElementById("title").style.setProperty("--color",border);
	document.getElementById("sans").style.color=border; // wa sans!
	
	document.getElementById("button").style.setProperty("--color",border);
}

function dig2(str) {
	if (str.length==0) {
		return "00";
	} else if (str.length==1) {
		return "0"+str;
	}
	return str;
}

function randomForFun(e) {
	var random=Math.floor(Math.random()*16777216);
	if (random==16777216) {
		console.log("와 이게 뜨네"); // 와 이게 뜨네
		random=16777215;
	}
	document.getElementById("code").value=random;
	decodeColorCode();
}

var rgbe=document.getElementsByClassName("rgb");
for (var idx=0; idx<rgbe.length; idx++) {
	rgbe[idx].addEventListener('input',updateColor);
}
document.getElementById("col").addEventListener('input',updateRGB);
document.getElementById("code").addEventListener('input',decodeColorCode);
document.getElementById("codealpha").addEventListener('input',decodeColorCodeA);