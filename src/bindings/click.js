import { evalInScope } from '../utils'

export default {
  name: 'click',
  init: ({element, rawValue, customElement, context})=>{
    element.addEventListener('click', (ev)=>{
      evalInScope(rawValue, context);
    })
  },
  evaluateValue: false
}
