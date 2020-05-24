/**
 * @class - Add or remove element classes
 *
 * Example:
 *
 * <div @class="{open: this.isOpen, highlighted: this.isHighlighted}">
 *    ...
 * </div>
 *
 */
import bindings from '../binding_manager'

export default {
  name: 'class',
  evaluateValue: true,
  update: ({element, evalValue, customElement})=> {
    //console.log("Got " + ret);
    for (let [key, val] of Object.entries(evalValue)) {
      val ? element.classList.add(key) : element.classList.remove(key);
    }
  }
}

