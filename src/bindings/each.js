import { autorun } from 'mobx'
import bindings from '../binding_manager'
import { evalInScope, insertTemplateMarkers, clearTemplateMarkers, appendChildToTemplateMarkers } from '../utils'

export default {
  name: 'each',
  init : ({element, rawValue, customElement, context})=> {
    console.log("Storing repeated node");
    let repeatedContent = element.content;
    let repeatedID = Math.floor(Math.random() * 1e9);
    let cas = element.getAttribute('@as');
    // insert markers
    console.log("Inserting template markers");
    let markers = insertTemplateMarkers(element, repeatedID);

    // setup autorun, needed here because element is going away
    autorun((reaction)=>{
      let evalValue = evalInScope(rawValue, context);
      clearTemplateMarkers(markers);
      console.log("Iterating " + evalValue.length + " items");
      evalValue.forEach((item)=>{
        let newNode = repeatedContent.cloneNode(true);
        
        let newContext = {};
        newContext[cas] = item;
        newContext.this = context;

        let children = Array.from(newNode.childNodes);
        children.forEach( (n)=> {
          n.smartContext = newContext;
        });
        window.children = children;
        appendChildToTemplateMarkers(markers, newNode);

        children.forEach( (n)=> {
          if (!n.isSmartElement) {
            console.log("APPLYING BINDINGS NOW FOR EACH");
            bindings.applyBindingsToInnerElement(n, customElement, newContext);
            console.log("DONE APPLYING BINDINGS");
          }
        });
      });
    }); // end autorun

  },
  managesChildren: true
}
