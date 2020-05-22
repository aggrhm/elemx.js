import bindings from './binding_manager'
import { buildTemplate, removeElementDisposables } from './utils'

class ReactiveElement extends HTMLElement {
  constructor() {
    super();
    console.log("Start constructor for " + this.nodeName);
    this.isReactiveElement = true;
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
    if (!this.hasReactiveParent()) {
      console.log("APPLYING ROOT LEVEL BINDING FOR " + this.nodeName);
      bindings.applyBindings(this);
      this.isReactiveRoot = true;
    }
    this.onMount();
  }

  disconnectedCallback() {
    // remove bindings
    if (this.isReactiveRoot) {
      console.log("Removing disposables in custom element");
      removeElementDisposables(this);
    }
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

  hasReactiveParent() {
    let host = this.getRootNode().host
    if (host && host.isReactiveElement) return true;
    let p = this.parentElement;
    while (true) {
      if (!p) break;
      if (p.isReactiveElement) return true;
      p = p.parentElement;
    }
    return false;
  }
  
}

export default ReactiveElement
