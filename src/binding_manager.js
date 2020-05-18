import { autorun } from 'mobx'
import { evalInScope, setInScope } from './utils'

import sync from './bindings/sync'
import click from './bindings/click'
import each from './bindings/each'
import text from './bindings/text'
import on_return from './bindings/on-return'

class BindingManager {
  constructor() {
    this.bindings = {};
  }

  registerBinding(binding) {
    console.log("Registering binding " + binding.name);
    this.bindings['@' + binding.name] = binding;
  }

  applyBindings(customElement) {
    console.log("Binding " + customElement.nodeName + " to dom");

    this.applyBindingsToInnerElement(customElement);

  }

  applyBindingsToInnerElement(element, customElement, context) {
    //console.log("Applying bindings to " + element.nodeName);
    
    if (!customElement) {
      customElement = element.parentNode.getRootNode().host;
    }
    element.smartContextElement = customElement;
    context = context || element.smartContext || customElement;
    // apply to child if has context
    let updateChildren = true;
        
    if (true) {
      if (!element.attributes) return;
      if (element.onBinding) element.onBinding(context);

      for (let i=0; i < element.attributes.length; i++) {
        let attr = element.attributes[i];
        console.log("Processing binding " + attr.nodeName + " in " + element.nodeName);
        // check binding
        let binding = this.bindings[attr.nodeName];
        if (binding) {
          if (binding.managesChildren) updateChildren = false;
          console.log("Setting up auto run for " + binding.name);
          let rawValue = attr.nodeValue;
          if (binding.init) binding.init({element, rawValue, customElement, context});
          if (binding.update) {
            autorun((reaction)=>{
              let evalValue = null;
              let rawValue = attr.nodeValue;
              if (binding.evaluateValue != false) {
                evalValue = evalInScope(rawValue, customElement);
              }
              console.log("Value is " + evalValue);
              binding.update({element, rawValue, evalValue, customElement, context});
            })
          }
        } else if (attr.nodeName[0] == ":") {
          // check input key
          let field = attr.nodeName.substring(1);
          autorun((reaction)=>{
            console.log("Handling param attribute " + field);
            element[field] = evalInScope(attr.nodeValue, context);
          });
        } else if (attr.nodeName[0] == "@") {
          // check for event
          if (attr.nodeName.substring(1,4) == "on-") {
            element.addEventListener(attr.nodeName.substring(4), (ev)=>{
              let rawValue = attr.nodeValue;
              evalInScope(rawValue, customElement);
            })
          }
        }
      }
    }
    // apply to children
    if (updateChildren) {
      let els = (element.shadowRoot ? element.shadowRoot : element).childNodes;
      els.forEach((iel)=>{
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

}

let bindingManager = new BindingManager()
bindingManager.registerBinding(text);
bindingManager.registerBinding(click);
bindingManager.registerBinding(sync);
bindingManager.registerBinding(each);
bindingManager.registerBinding(on_return);

export default bindingManager;
