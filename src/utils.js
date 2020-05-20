export function evalInScope(script, scope, opts) {
  opts = opts ? opts : {};
  let _this = scope.this ? scope.this : scope;
  let fargnames = ['context'];
  let fargs = [scope];
  let fn = `"use strict"; return ${script}`;

  if (opts.set) {
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
        $script
      }
    `
  }

  let fbargs = fargnames;
  fbargs.push(fn);
  if (opts.debug) {
    // NOTE: this causes extra bindings
    console.log("Debugging eval===");
    console.log(JSON.stringify(fbargs));
    console.log(JSON.stringify(fargs));
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

export default {
  evalInScope,
  buildTemplate
}
