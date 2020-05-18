export function evalInScope(script, scope) {
  const scopedEval = Function(`"use strict"; return ${script}`).bind(scope)();
  return scopedEval;
}

export function setInScope(script, scope, newValue) {
  const scopedEval = Function('newval', `"use strict"; ${script} = newval`).bind(scope)(newValue);
  return scopedEval;
}

export function buildTemplate(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template;
}

export default {
  evalInScope,
  setInScope
}
