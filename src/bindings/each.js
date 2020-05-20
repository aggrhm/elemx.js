import bindings from '../binding_manager'

export default {
  name: 'each',
  init : ({element})=> {
    console.log("Storing repeated node");
    element.repeatedContent = element.firstElementChild.content;
  },
  update: ({element, evalValue, customElement, context})=> {
    element.innerHTML = "";
    console.log("Iterating " + evalValue.length + " items");
    evalValue.forEach((item)=>{
      let newNode = element.repeatedContent.cloneNode(true);
      
      let newContext = {};
      //console.log("Building context.");
      newContext[element.getAttribute('@as')] = item;
      newContext.this = context;
      //console.log("Built context.");
      //window.newNode = newNode;
      // put the context on all children
      let children = Array.from(newNode.childNodes);
      children.forEach( (n)=> {
        n.smartContext = newContext;
      });
      window.children = children;
      element.appendChild(newNode);

      children.forEach( (n)=> {
        if (!n.isSmartElement) {
          console.log("APPLYING BINDINGS NOW FOR EACH");
          bindings.applyBindingsToInnerElement(newNode, customElement, newContext);
          console.log("DONE APPLYING BINDINGS");
        }
      });
    })

  },
  managesChildren: true
}
