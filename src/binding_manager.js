import { autorun } from 'mobx'
import { evalInScope } from './utils'

import bnd_sync from './bindings/sync'
import bnd_click from './bindings/click'
import bnd_each from './bindings/each'
import bnd_text from './bindings/text'
import bnd_on_return from './bindings/on-return'
import bnd_class from './bindings/class'

class BindingManager {
  constructor() {
    this.bindings = {};
  }

  registerBinding(binding) {
    console.log("Registering binding " + binding.name);
    this.bindings['@' + binding.name] = binding;
  }

  applyBindings(customElement) {
    console.log("STARTING:: Binding " + customElement.nodeName + " to dom");

    this.applyBindingsToInnerElement(customElement);
    console.log("FINISHED:: Binding " + customElement.nodeName + " to dom");
  }

  applyBindingsToInnerElement(element, customElement, context) {
    //console.log("Applying bindings to " + element.nodeName);
    
    // find parent custom element
    if (!customElement) {
      customElement = element.parentNode.getRootNode().host;
    }
    element.smartContextElement = customElement;

    // find parent context if in each block
    if (!context) {
      context
    }
    context = context || element.smartContext || element.parentElement.smartContext || customElement;
    element.smartContext = context

    // apply to children
    let updateChildren = true;
        
    if (true) {
      if (!element.attributes) return;
      if (element.onBinding) element.onBinding(context);

      for (let i=0; i < element.attributes.length; i++) {
        let attr = element.attributes[i];
        let bres = null;
        if (attr.nodeName[0] == ":") {
          bres = this.processParamBinding(element, customElement, context, attr);
        } else if (attr.nodeName[0] == "@") {
          bres =this.processDirectiveBinding(element, customElement, context, attr);
        }
        if (bres && !bres.updateChildren) {
          updateChildren = false;
        }
      }
    }
    // apply to children
    if (updateChildren) {
      let els = (element.shadowRoot ? element.shadowRoot : element).childNodes;
      Array.from(els).forEach((iel)=>{
        if (iel.isSmartElement) return;
        //console.log("Applying binding for child " + iel.nodeName);
        if (element.isSmartElement) {
          this.applyBindingsToInnerElement(iel, element, element);
        } else{
          this.applyBindingsToInnerElement(iel, customElement, context);
        }
        //bindVText(iel, customElement);
      });
    }
  }

  processDirectiveBinding(element, customElement, context, attr) {
    let ret = {updateChildren: true};
    console.log("Processing @binding " + attr.nodeName + " in " + element.nodeName);
    // check binding
    let binding = this.bindings[attr.nodeName];
    if (binding) {
      if (binding.managesChildren) ret.updateChildren = false;
      //console.log("Setting up auto run for " + binding.name);
      let rawValue = attr.nodeValue;
      if (binding.init) binding.init({element, rawValue, customElement, context});
      if (binding.update) {
        autorun((reaction)=>{
          let evalValue = null;
          let rawValue = attr.nodeValue;
          if (binding.evaluateValue != false) {
            evalValue = evalInScope(rawValue, context);
          }
          console.log(`${element.nodeName} ${attr.nodeName} value is ${evalValue}`);
          binding.update({element, rawValue, evalValue, customElement, context});
        })
      }
    } else {
      // check for event
      if (attr.nodeName.substring(1,4) == "on-") {
        element.addEventListener(attr.nodeName.substring(4), (ev)=>{
          let rawValue = attr.nodeValue;
          let data = ev;
          if (ev.detail) { data = ev.detail; }
          evalInScope(rawValue, context, {event: data});
        })
      }
    }
    return ret;
  }

  processParamBinding(element, customElement, context, attr) {
    let ret = {updateChildren: true};
    console.log("Processing :binding " + attr.nodeName + " in " + element.nodeName);
    // check input key
    let field = attr.nodeName.substring(1);
    autorun((reaction)=>{
      console.log(`${element.nodeName} Handling param attribute ${field}`);
      element[field] = evalInScope(attr.nodeValue, context);
    });
    return ret;
  }

}

let bindingManager = new BindingManager()
bindingManager.registerBinding(bnd_text);
bindingManager.registerBinding(bnd_click);
bindingManager.registerBinding(bnd_sync);
bindingManager.registerBinding(bnd_each);
bindingManager.registerBinding(bnd_on_return);
bindingManager.registerBinding(bnd_class);

export default bindingManager;
