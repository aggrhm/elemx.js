import { autorun } from 'mobx'
import { evalInScope, addElementDisposable, debugLog } from './utils'

class BindingManager {
  constructor() {
    this.bindings = {};
  }

  registerBinding(binding) {
    debugLog("Registering binding " + binding.name);
    this.bindings['@' + binding.name] = binding;
  }

  applyBindings(customElement) {
    debugLog("STARTING:: Binding " + customElement.nodeName + " to dom");

    this.applyBindingsToInnerElement(customElement);
    debugLog("FINISHED:: Binding " + customElement.nodeName + " to dom");
  }

  applyBindingsToInnerElement(element, customElement, context) {
    //console.log("Applying bindings to " + element.nodeName);
    
    // find parent custom element
    if (!customElement) {
      customElement = element.getRootNode().host;
    }
    element.reactiveContextElement = customElement;

    // find parent context if in each block
    if (!context) {
      context
    }
    context = context || element.reactiveContext || (element.parentElement && element.parentElement.reactiveContext) || customElement;
    element.reactiveContext = context

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

    // mark as binded
    if (element.isReactiveElement) {
      element._reactiveBindingsApplied = true;
      console.log("Applied bindings to " + element.nodeName);
    }
  }

  processDirectiveBinding(element, customElement, context, attr) {
    let ret = {updateChildren: true};
    debugLog("Processing @binding " + attr.nodeName + " in " + element.nodeName);
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
          debugLog(`${element.nodeName} ${attr.nodeName} value is ${evalValue}`);
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
    debugLog("Processing :binding " + attr.nodeName + " in " + element.nodeName);
    // check input key
    var dbl = false;
    var field = null;
    if (attr.nodeName[1] == ":") {
      // this is double bind
      dbl = true
      field = attr.nodeName.substring(2);
    } else {
      field = attr.nodeName.substring(1);
    }

    // subscribe to binding
    let disposer = autorun((reaction)=>{
      debugLog(`${element.nodeName} Handling param attribute ${field}`);
      let val = evalInScope(attr.nodeValue, context);
      element._isBindingUpdating = true;
      if (field in element) {
        // update directly
        element[field] = val;
      } else {
        // update attribute
        if (val == false) {
          element.removeAttribute(field);
        } else if (val == true) {
          element.setAttribute(field, "");
        } else {
          element.setAttribute(field, val);
        }
      }
      element._isBindingUpdating = false;
    });
    addElementDisposable(element, disposer);

    if (dbl) {
      // subscribe to attribute changes
      let observer = new MutationObserver( (mutations)=>{
        if (element._isBindingUpdating == true) return;
        mutations.forEach( (mutation)=>{
          if (mutation.type == "attributes" && mutation.attributeName == field) {
            let rattr = element.attributes[mutation.attributeName];
            var val = null;
            if (rattr == null) {
              val = false;
            } else {
              val = rattr.value;
              if (val == "") { val = true; }
            }
            evalInScope(attr.nodeValue, context, {set: val});
          }
        });
      });
      observer.observe(element, {attributes: true});
      addElementDisposable(element, {
        dispose: ()=> {
          observer.disconnect();
        }
      });
    }
    return ret;
  }

}

let bindingManager = new BindingManager()

export default bindingManager;
