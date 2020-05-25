export default {
  name: 'html',
  evaluateValue: true,
  update: ({element, evalValue, customElement})=> {
    element.innerHTML = evalValue;
  }
}

