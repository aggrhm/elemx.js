import { evalInScope, setInScope } from '../utils'

export default {
  name: 'click',
  init: ({element, rawValue, customElement})=>{
    element.addEventListener('click', (ev)=>{
      evalInScope(rawValue, customElement);
    })
  },
  evaluateValue: false
}
