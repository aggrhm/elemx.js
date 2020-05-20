import { evalInScope } from '../utils'

export default {
  name: 'sync',
  init: ({element, rawValue, customElement})=> {
    let bind_event = element.getAttribute("@sync-event") || "change";
    element.addEventListener(bind_event, (ev)=> {
      if (ev.target._isBindingUpdating == true) return;
      let val = ev.target.value;
      if (element.type == "checkbox") val = element.checked;
      evalInScope(rawValue, customElement, {set: val});
    });
  },
  update: ({element, rawValue, evalValue})=> {
    element._isBindingUpdating = true;
    if (element.type == 'checkbox') {
      element.checked = evalValue;
    } else {
      element.value = evalValue;
    }
    element._isBindingUpdating = false;
  }
}
