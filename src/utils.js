export function evalInScope(script, scope, opts) {
  opts = opts ? opts : {};
  let _this = (scope && scope.this) ? scope.this : scope;
  let fargnames = ['context'];
  let fargs = [scope];
  let fn = `"use strict"; return ${script}`;

  if ('set' in opts) {
    fargnames.push('newval');
    fargs.push(opts.set);
    fn = `"use strict"; ${script} = newval`;
  } else if (opts.event) {
    fargnames.push('ev');
    fargs.push(opts.event);
    fn = `
      "use strict";
      if (typeof(${script}) == 'function') {
        ${script}(ev);
      } else {
        ${script};
      }
    `
  }

  let fbargs = fargnames;
  fbargs.push(fn);
  if (opts.debug) {
    // NOTE: this causes extra bindings
    console.log("Debugging eval===");
    console.log(fn);
    console.log(fbargs);
    console.log(fargs);
    console.log("End Debugging eval===");
  }
  const scopedEval = Function(...fbargs).bind(_this)(...fargs);
  return scopedEval;
}

export function buildTemplate({html, css}) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  if (css) {
    let style = `<style>${css}</style>\n`
    html = style + html;
  }
  template.innerHTML = html;
  return template;
}

export function insertTemplateMarkers(node, id) {
  let sm = document.createComment(id);
  let em = document.createComment("/" + id);
  node.parentNode.insertBefore(sm, node);
  node.parentNode.insertBefore(em, node);
  node.remove();
  return [sm, em];
}

export function clearTemplateMarkers(markers) {
  while(true) {
    let sib = markers[0].nextSibling;
    if (!sib || (sib.nodeType == 8 && sib.textContent == `/${markers[0].textContent}`)) break;
    sib.remove();
    //console.log("Removing " + sib.nodeName);
  }
}

export function appendChildToTemplateMarkers(markers, child) {
  markers[0].parentNode.insertBefore(child, markers[1]);
}

export default {
  evalInScope,
  buildTemplate
}
