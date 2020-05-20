import { evalInScope } from '../utils'

export default {
  name: 'on-return',
  init: ({element, rawValue, customElement})=>{
    element.addEventListener('keypress', (ev)=>{
      if (ev.keyCode == 13) {
        evalInScope(rawValue, customElement);
      }
    })
  },
  evaluateValue: false
}

