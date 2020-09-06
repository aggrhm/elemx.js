/**
 * @if - Conditionally show or hide elements. To be used
 * with <template> elements.
 *
 * Example:
 *
 * <template @if="this.isVisible">
 *    ...
 * </template>
 *
 */
import { autorun, reaction } from 'mobx'
import bindings from '../binding_manager'
import { evalInScope, insertTemplateMarkers, clearTemplateMarkers, appendChildToTemplateMarkers, debugLog } from '../utils'

export default {
  name: 'if',
  init : ({element, rawValue, customElement, context})=> {
    debugLog("Storing repeated node");
    let repeatedContent = element.content;
    let repeatedID = Math.floor(Math.random() * 1e9);
    // insert markers
    debugLog("Inserting template markers");
    let markers = customElement.insertTemplateMarkers(element, repeatedID);

    // setup autorun, needed here because element is going away
    reaction(
      ()=> {
        let cond = evalInScope(rawValue, context);
        return cond;
      },
      (cond, reaction)=>{
        clearTemplateMarkers(markers);
        debugLog("Handling conditional: " + cond);
        if (cond) {
          let newNode = repeatedContent.cloneNode(true);
          let children = Array.from(newNode.childNodes);
          customElement.appendToTemplateMarkers(markers, children, context);
        };
      },
      {
        fireImmediately: true
      }
    ); // end autorun

  },
  managesChildren: true
}

