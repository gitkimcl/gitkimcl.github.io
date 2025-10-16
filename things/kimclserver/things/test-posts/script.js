class PostElement extends HTMLElement {
	#sr = null;
	
	constructor() {
		super();
		this.#sr = this.attachShadow({mode:'open'});
	}
	
	connectedCallback() {
		const template = document.getElementById('post-template').content;
		this.#sr.appendChild(template.cloneNode(true));
	}
}

customElements.define('test-post', PostElement);