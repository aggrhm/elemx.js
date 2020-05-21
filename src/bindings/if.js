import { autorun, reaction } from 'mobx'
import bindings from '../binding_manager'
import { evalInScope, insertTemplateMarkers, clearTemplateMarkers, appendChildToTemplateMarkers } from '../utils'

export default {
  name: 'if',
  init : ({element, rawValue, customElement, context})=> {
    console.log("Storing repeated node");
    let repeatedContent = element.content;
    let repeatedID = Math.floor(Math.random() * 1e9);
    // insert markers
    console.log("Inserting template markers");
    let markers = insertTemplateMarkers(element, repeatedID);

    // setup autorun, needed here because element is going away
    reaction(
      ()=> {
        let cond = evalInScope(rawValue, context);
        return cond;
      },
      (cond, reaction)=>{
        clearTemplateMarkers(markers);
        console.log("Handling conditional: " + cond);
        if (cond) {
          let newNode = repeatedContent.cloneNode(true);
          
          let children = Array.from(newNode.childNodes);
          /*
          children.forEach( (n)=> {
            n.smartContext = newContext;
          });
          window.children = children;
          */
          appendChildToTemplateMarkers(markers, newNode);

          children.forEach( (n)=> {
            console.log("APPLYING BINDINGS NOW FOR EACH");
            bindings.applyBindingsToInnerElement(n, customElement, context);
            console.log("DONE APPLYING BINDINGS");
          });
        };
      },
      {
        fireImmediately: true
      }
    ); // end autorun

  },
  managesChildren: true
}

