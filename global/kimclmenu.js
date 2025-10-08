class KimclMenuElement extends HTMLElement {
	#sr = null;
	
	constructor() {
		super();
		this.#sr = this.attachShadow({mode:'open'});
	}
	
	connectedCallback() {
		fetch('/global/kimclmenu.html')
			.then((res) => {
				return res.text();
			})
			.then((text) => {
				this.#sr.innerHTML = text;
				let sc = this.#sr.getElementById('script');
				let nsc = document.createElement('script');
				nsc.type = "module";
				nsc.append(sc.innerHTML);
				this.#sr.replaceChild(nsc, sc);
				return;
			})
			.catch((err) => {
				console.log(err);
				this.#sr.innerHTML = `error lol`;
			});
	}
}

customElements.define('kimcl-menu', KimclMenuElement);