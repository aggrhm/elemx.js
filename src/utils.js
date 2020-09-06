export function evalInScope(script, scope, opts) {
  opts = opts ? opts : {};
  let _this = (scope && scope._this) ? scope._this : scope;
  let fargnames = ['context'];
  let fargs = [scope];

  // add locals
  //window.lastScope = scope;
  if (scope && scope._locals) {
    Object.keys(scope._locals).forEach( (key)=> {
      fargnames.push(key);
      fargs.push(scope._locals[key]);
    });
  }
  let fn = `"use strict"; return ${script}`;

  if ('set' in opts) {
    fargnames.push('newval');
    fargs.push(opts.set);
    fn = `"use strict"; ${script} = newval`;
  } else if (opts.event) {
    fargnames.push('ev');
    fargs.push(opts.event);
    if (script.includes("(")) {
      fn = `
        "use strict";
        ${script};
      `
    } else {
      fn = `
        "use strict";
        ${script}(ev);
      `
    }
  }

  let fbargs = fargnames;
  fbargs.push(fn);
  if (opts.debug) {
    // NOTE: this causes extra bindings
    debugLog("Debugging eval===");
    debugLog(fn);
    debugLog(fbargs);
    debugLog(fargs);
    debugLog("End Debugging eval===");
  }
  const scopedEval = Function(...fbargs).bind(_this)(...fargs);
  return scopedEval;
}

export function buildTemplate({html, css}) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  html = html.replace(/{{([^\}]*)}}/g, (m, inner)=>{
    return `<span @text="${inner.trim()}"></span>`
  });
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
    removeElementDisposables(sib);
    sib.remove();
    //console.log("Removing " + sib.nodeName);
  }
}

export function appendChildToTemplateMarkers(markers, child) {
  markers[0].parentNode.insertBefore(child, markers[1]);
}

export function addElementDisposable(element, disposable) {
  element._disposables = element._disposables || [];
  if (typeof(disposable) == 'function') {
    disposable = {dispose: disposable};
  }
  element._disposables.push(disposable);
}

export function removeElementDisposables(element) {
  setTimeout(()=>{
    //console.log(`Looking at ${element.nodeName}`);
    if (element._disposables) {
      debugLog(`Disposing ${element._disposables.length} disposables for ${element.nodeName}`);
      element._disposables.forEach((b)=> { b.dispose() });
      element._disposables = [];
    }
    // iterate children
    element.childNodes.forEach((c)=>{
      removeElementDisposables(c);
    });
    // remove from shadow dom
    if (element.isReactiveElement && element.shadowRoot) {
      //console.log("Disposing for shadow dom also.");
      element.shadowRoot.childNodes.forEach((c)=>{
        removeElementDisposables(c);
      });
    }
  }, 10);
}

export var DEBUG = false;

export function debugLog(str) {
  if (DEBUG) {
    console.log(str);
  }
}

export default {
  DEBUG,
  debugLog,
  evalInScope,
  buildTemplate
}
