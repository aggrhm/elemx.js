import bindings from './binding_manager'
import { buildTemplate } from './utils'

class Element extends HTMLElement {
  constructor() {
    super();
    this.isSmartElement = true;
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(buildTemplate(this.templateHTML()).content);
    //let tc = document.getElementById("tpl-" + this.nodeName.toLowerCase()).content;
    //this.shadowRoot.appendChild(tc.cloneNode(true));
  }
  
  connectedCallback() {
    this.onMount();
    bindings.applyBindings(this);
  }
  
  onMount() {
  
  }
  
}

export default Element
