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
    if (!this.hasCOBXParent()) {
      bindings.applyBindings(this);
    }
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

  hasCOBXParent() {
    let host = this.getRootNode().host
    if (host && host.isSmartElement) return true;
    let p = this.parentElement;
    while (true) {
      if (!p) break;
      if (p.isSmartElement) return true;
      p = p.parentElement;
    }
    return false;
  }
  
}

export default Element
