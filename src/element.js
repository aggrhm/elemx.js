import bindings from './binding_manager'
import { buildTemplate } from './utils'

class Element extends HTMLElement {
  constructor() {
    super();
    this.isSmartElement = true;
    this.attachShadow({mode: 'open'});
    console.log("Building shadow root for " + this.nodeName);
    let content = buildTemplate({html: this.templateHTML(), css: this.templateCSS()}).content;
    this.shadowRoot.appendChild(content);
    //let tc = document.getElementById("tpl-" + this.nodeName.toLowerCase()).content;
    //this.shadowRoot.appendChild(tc.cloneNode(true));
    console.log("End constructor for " + this.nodeName);
  }
  
  connectedCallback() {
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
