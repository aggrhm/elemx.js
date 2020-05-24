import { evalInScope } from '../utils'

export default {
  name: 'sync',
  init: ({element, rawValue, customElement})=> {
    let bind_event = element.getAttribute("@sync-event") || "change";
    element.addEventListener(bind_event, (ev)=> {
      //console.log("Change occurred. binding updating = " + ev.target.isBindingUpdating);
      if (ev.target._isBindingUpdating == true) return;
      let val = ev.target.value;
      if ('checked' in element) val = element.checked;
      evalInScope(rawValue, customElement, {set: val});
    });
  },
  update: ({element, rawValue, evalValue})=> {
    element._isBindingUpdating = true;
    if ('checked' in element) {
      element.checked = evalValue;
    } else {
      element.value = evalValue;
    }
    element._isBindingUpdating = false;
  }
}
