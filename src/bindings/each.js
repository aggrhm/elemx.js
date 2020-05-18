import bindings from '../binding_manager'

export default {
  name: 'each',
  init : ({element})=> {
    console.log("Storing repeated node");
    element.repeatedNode = element.firstElementChild;
  },
  update: ({element, evalValue, customElement, context})=> {
    element.innerHTML = "";
    console.log("Iterating " + evalValue.length + " items");
    evalValue.forEach((item)=>{
      let newNode = element.repeatedNode.cloneNode(true);
      
      let newContext = {};
      //console.log("Building context.");
      newContext[element.getAttribute('@as')] = item;
      newContext.outer = context;
      //console.log("Built context.");
      newNode.smartContext = newContext;
      newNode = element.appendChild(newNode);
      if (!newNode.isSmartElement) {
        bindings.applyBindingsToInnerElement(newNode, customElement, newContext);
      }
    })

  },
  managesChildren: true
}
