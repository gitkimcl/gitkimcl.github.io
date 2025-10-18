class KServerMenuElement extends HTMLElement {
	#sr = null;
	
	constructor() {
		super();
		this.#sr = this.attachShadow({mode:'open'});
	}
	
	connectedCallback() {
		fetch('/things/kimclserver/global/kservermenu.html')
			.then((res) => {
				return res.text();
			})
			.then((text) => {
				this.#sr.innerHTML = text.match(/(?<=<template>).*?(?=<\/template>)/s);
				let sc = this.#sr.getElementById('script');
				let nsc = document.createElement('script');
				nsc.type = "module";
				nsc.append(sc.innerHTML);
				this.#sr.replaceChild(nsc, sc);
				return;
			})
			.catch((err) => {
				console.error(err);
				this.#sr.innerHTML = `error lol`;
			});
	}
}

customElements.define('kserver-menu', KServerMenuElement);