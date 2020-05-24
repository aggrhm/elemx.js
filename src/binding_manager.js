import { autorun } from 'mobx'
import { evalInScope, addElementDisposable } from './utils'

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
      customElement = element.getRootNode().host;
    }
    element.smartContextElement = customElement;

    // find parent context if in each block
    if (!context) {
      context
    }
    context = context || element.smartContext || (element.parentElement && element.parentElement.smartContext) || customElement;
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
      let els = element.childNodes;
      // iterate children
      Array.from(els).forEach((iel)=>{
        this.applyBindingsToInnerElement(iel, customElement, context);
      });
      // iterate shadow root children
      if (element.isReactiveElement && element.shadowRoot) {
        let schilds = element.shadowRoot.childNodes;
        Array.from(schilds).forEach((iel)=>{
          this.applyBindingsToInnerElement(iel, element, element);
        });
      }
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
        let disposer = autorun((reaction)=>{
          let evalValue = null;
          let rawValue = attr.nodeValue;
          if (binding.evaluateValue != false) {
            evalValue = evalInScope(rawValue, context);
          }
          console.log(`${element.nodeName} ${attr.nodeName} value is ${evalValue}`);
          binding.update({element, rawValue, evalValue, customElement, context});
        });
        addElementDisposable(element, disposer);
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
    let disposer = autorun((reaction)=>{
      console.log(`${element.nodeName} Handling param attribute ${field}`);
      element[field] = evalInScope(attr.nodeValue, context);
    });
    addElementDisposable(element, disposer);
    return ret;
  }

}

let bindingManager = new BindingManager()

export default bindingManager;
