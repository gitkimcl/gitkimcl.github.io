class KimclMenuElement extends HTMLElement {
	#sr = null;
	
	constructor() {
		super();
		this.#sr = this.attachShadow({mode:'open'});
	}
	
	connectedCallback() {
		let xhttp = new XMLHttpRequest();
		xhttp.open('GET', '/global/kimclmenu.html', false);
		xhttp.send();
		let status = xhttp.status;
		if (status === 0 || (200 <= status && status < 400)) {
			this.#sr.innerHTML = xhttp.responseText;
			let sc = this.#sr.getElementById('script');
			let nsc = document.createElement('script');
			nsc.type = "module";
			nsc.append(sc.innerHTML);
			this.#sr.replaceChild(nsc, sc);
			return;
		}
		this.#sr.innerHTML = `error ${status}`;
	}
}

customElements.define('kimcl-menu', KimclMenuElement);