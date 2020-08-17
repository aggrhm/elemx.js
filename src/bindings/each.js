/**
 * @each - Iterate element for each item in list. To be used
 * with <template> elements.
 *
 * Example:
 *
 * <template @each="this.todos" @as="todo">
 *    ...
 * </template>
 *
 */
import { autorun, reaction } from 'mobx'
import bindings from '../binding_manager'
import { evalInScope, insertTemplateMarkers, clearTemplateMarkers, appendChildToTemplateMarkers, addElementDisposable, removeElementDisposables, debugLog } from '../utils'

export default {
  name: 'each',
  init : ({element, rawValue, customElement, context})=> {
    debugLog("Storing repeated node");
    let repeatedContent = element.content;
    let repeatedID = Math.floor(Math.random() * 1e9);
    let cas = element.getAttribute('@as');
    // insert markers
    debugLog("Inserting template markers");
    let markers = insertTemplateMarkers(element, repeatedID);

    // setup autorun, needed here because element is going away
    let disposer = reaction(
      ()=> {
        let array = evalInScope(rawValue, context);
        return array.slice();
      },
      (array, reaction)=>{
        clearTemplateMarkers(markers);
        debugLog("Iterating " + array.length + " items");
        array.forEach((item)=>{
          let newNode = repeatedContent.cloneNode(true);
          
          let newContext = {};
          newContext[cas] = item;
          newContext._this = context;
          newContext._locals = {};
          newContext._locals[cas] = item;

          let children = Array.from(newNode.childNodes);
          /*
          children.forEach( (n)=> {
            n.smartContext = newContext;
          });
          window.children = children;
          */
          appendChildToTemplateMarkers(markers, newNode);

          children.forEach( (n)=> {
            debugLog("APPLYING BINDINGS NOW FOR EACH");
            bindings.applyBindingsToInnerElement(n, customElement, newContext);
            debugLog("DONE APPLYING BINDINGS");
          });
        });
      },
      {
        fireImmediately: true
      }
    ); // end autorun
    addElementDisposable(markers[0], disposer);

  },
  managesChildren: true
}
