import bindings from './binding_manager'
import { buildTemplate } from './utils'

class Element extends HTMLElement {
  constructor() {
    super();
    console.log("Start constructor for " + this.nodeName);
    this.isSmartElement = true;
    this.init();

    this.attachShadow({mode: 'open'});
    //let tc = document.getElementById("tpl-" + this.nodeName.toLowerCase()).content;
    //this.shadowRoot.appendChild(tc.cloneNode(true));
    console.log("End constructor for " + this.nodeName);
  }

  init() {

  }
  
  connectedCallback() {
    console.log("Building shadow root for " + this.nodeName);
    let content = buildTemplate({html: this.templateHTML(), css: this.templateCSS()}).content;
    this.shadowRoot.appendChild(content);
    bindings.applyBindings(this);
    this.onMount();
  }
  
  onMount() {
  
  }

  templateHTML() {
    return "";
  }

  templateCSS() {
    return "";
  }

  emitEvent(name, data) {
    let ev = new CustomEvent(name, {detail: data});
    this.dispatchEvent(ev);
  }
  
}

export default Element
