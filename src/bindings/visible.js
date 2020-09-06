export default {
  name: 'visible',
  evaluateValue: true,
  update: ({element, evalValue, customElement})=> {
    if (evalValue == true) {
      element.style.removeProperty('display');
    } else {
      element.style.setProperty('display', 'none');
    }
  }
}
