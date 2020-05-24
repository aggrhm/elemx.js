export default {
  name: 'text',
  evaluateValue: true,
  update: ({element, evalValue, customElement})=> {
    //console.log("Got " + ret);
    element.innerText = evalValue;
  }
}
