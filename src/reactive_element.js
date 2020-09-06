import bindings from './binding_manager'
import { buildTemplate, removeElementDisposables, debugLog } from './utils'

class ReactiveElement extends HTMLElement {
  constructor() {
    super();
    debugLog("Start constructor for " + this.nodeName);
    this.isReactiveElement = true;
    this.init();

    this.attachShadow({mode: 'open'});
    //let tc = document.getElementById("tpl-" + this.nodeName.toLowerCase()).content;
    //this.shadowRoot.appendChild(tc.cloneNode(true));
    debugLog("End constructor for " + this.nodeName);
  }

  init() {

  }
  
  connectedCallback() {
    debugLog("Building shadow root for " + this.nodeName);
    let content = buildTemplate({html: this.constructor.html, css: this.constructor.css}).content;
    this.shadowRoot.appendChild(content);
    let reactiveParent = this.reactiveParent
    // apply reactive bindings if no reactive root or bindings already applied
    if (reactiveParent == null || reactiveParent._reactiveBindingsApplied) {
      debugLog("APPLYING ROOT LEVEL BINDING FOR " + this.nodeName);
      bindings.applyBindings(this);
      this.isReactiveRoot = true;
    }
    this.onMount();
    debugLog("Done building shadow root for " + this.nodeName);
  }

  disconnectedCallback() {
    // remove bindings
    if (this.isReactiveRoot) {
      debugLog("Removing disposables in custom element");
      removeElementDisposables(this);
    }
  }
  
  onMount() {
  
  }

  static get html() {
    return "";
  }

  static get css() {
    return "";
  }

  emitEvent(name, data) {
    let ev = new CustomEvent(name, {detail: data});
    this.dispatchEvent(ev);
  }

  get reactiveParent() {
    let host = this.getRootNode().host
    if (host && host.isReactiveElement) return host;
    let p = this.parentElement;
    while (true) {
      if (!p) break;
      if (p.isReactiveElement) return p;
      p = p.parentElement;
    }
    return null;
  }
  
}

export default ReactiveElement
