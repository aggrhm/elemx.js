export default {
  name: 'text',
  evaluateValue: true,
  update: ({element, evalValue, customElement})=> {
    element.innerText = evalValue;
  }
}
