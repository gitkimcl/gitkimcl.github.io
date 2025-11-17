import { dialog } from './dialog.js';

export const d$ = (q) => document.getElementById(q);

export function deco(el) {
	$(".e", el).before(" "); // hair space
	$(".e", el).prepend($(`<span class="before">#</span>`));
	$(".e.ref > .before", el).text("ref. #"); // 6-per-em space
	$(".e.add > .before", el).text("Add");
	$(".e.add1 > .before", el).text("Add1");
	$(".e.add3 > .before", el).text("Add3");
	$("b.star", el).prepend("★").append("★");
	$("q:not(.exact, .star)", el).prepend("'").append("'");
	$("q.exact", el).prepend("\"").append("\"");;
	$("q.star", el).prepend("★").append("★");;
	$("span.wrapper.paren", el).prepend("(").append(" )"); // hair space
	$("span.namu", el).append("(...)");
	$("span.qm", el).text("?");
	$("data, time, span.qm", el).on("click", dialog); // dialog
}

export function get_kind(cls) {
	return (cls.contains('s'))?'s':
		(cls.contains('d'))?'d':
		(cls.contains('t'))?'t':
		(cls.contains('g'))?'g':
		(cls.contains('w'))?'w':
		(cls.contains('i'))?'i':
	'x';
}

export function get_p(id, content) {
	if (content.startsWith("<!--OUTER-->")) return $(content).last().addClass("p").addClass("htmlp").attr("data-pid",id);
	return $(`<p class="p" data-pid="${id}">${content}</p>`);
}

export function get_navp(p, id, content) {
	let np = $(`<a class="ndata nwp" href="#p${id}" data-pid="${id}"></a>`);
	if (content === "<!--OUTER--><hr>") np.addClass("invis").attr("tabindex","-1");
	if (content.startsWith("<!--OUTER--><h3>")) {
		np.addClass("nwh");
		np.append($(`<span class="ndesc">${p.text()}</span>`));
	} else {
		np.append($(`<span class="ndesc"></span>`).text($(".e:not(.ref, .add)",p).map(
			function () { return this.value; }
		).get().join()));
	}
	return np;
}

export function format_date(d, time, noyear) {
	let da = new Date(d);
	return `${noyear ? '' : `${da.getFullYear().toString().padStart(4,"0")}. `}${(da.getMonth()+1).toString().padStart(2,"0")}. ${da.getDate().toString().padStart(2,"0")}.${time ? ` (${da.getHours().toString().padStart(2,"0")}:${da.getMinutes().toString().padStart(2,"0")})` : ''}`;
}

var chcode = ['r','R','s','e','E','f','a','q','Q','t','T','d','w','W','c','z','x','v','g']
var jucode = ['k','o','i','O','j','p','u','P','h','hk','ho','hl','y','n','nj','np','nl','b','m','ml','l']
var jocode = ['','r','R','rt','s','sw','sg','e','f','fr','fa','fq','ft','fx','fv','fg','a','q','qt','t','T','d','w','c','z','x','v','g']
var cscode = ['','r','R','rt','s','sw','sg','e','E','f','fr','fa','fq','ft','fx','fv','fg','a','q','Q','qt','t','T','d','w','W','c','z','x','v','g']
export function k2e(str) {
	if (!str) return null;
	let res = ''
	for (let ch of str) {
		let c = ch.charCodeAt(0)
		if (0x1100 <= c && c <= 0x1112) { res += chcode[c - 0x1100]; continue; }
		if (0x1161 <= c && c <= 0x1175) { res += jucode[c - 0x1161]; continue; }
		if (0x11a8 <= c && c <= 0x11c2) { res += jocode[c - 0x11a7]; continue; }
		if (0x3131 <= c && c <= 0x314e) { res += cscode[c - 0x3130]; continue; }
		if (0x314f <= c && c <= 0x3163) { res += jucode[c - 0x314f]; continue; }
		if (0xac00 <= c && c <= 0xd7a3) {
			c -= 0xac00
			let chidx = Math.floor(c / 588)
			let juidx = Math.floor((c%588) / 28)
			let joidx = c%28
			res += chcode[chidx]
			res += jucode[juidx]
			if (joidx===0) continue;
			res += jocode[joidx]
			continue;
		}
		res += ch
	}
	return res;
}