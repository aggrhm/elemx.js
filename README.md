# ElemX.js

**ElemX** is a proof-of-concept front-end javascript library for connecting MobX to native Web Components with a Vue-like template binding syntax.

```
# import
$ npm install elemx

# use in project
import { ReactiveElement } from 'elemx';
```

## Why?

Yes, this is another front-end javascript framework, so why write it?

- I like the potential of native [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- I prefer using [MobX](https://mobx.js.org) for state management
- I like the template binding syntax of [Vue.js](https://vuejs.org/v2/guide/syntax.html) and [Knockout.js](https://knockoutjs.com/documentation/introduction.html)

## Example Code

### Hello World

```js
class HelloWorldElement extends ReactiveElement {
  @observable name = "World";
  
  templateHTML() {
    return `
      <p>
        Enter your name:
        <wl-textfield outlined placeholder="Your name" @sync="this.name" @sync-event="keyup"></wl-textfield>
      </p>
      <p>
        👋 Hello, {{ this.name }}!
      </p>
    `;
  }

  templateCSS() {
    // These styles are scoped to this component using the shadow dom
    return `
      p { ... }
    `;
  }
}
customElements.define('hello-world', HelloWorldElement);
```

### Live Code

- [Hello World](https://jsfiddle.net/agquick/ytcn6s7z/) - A must have

- [Todo List](https://jsfiddle.net/agquick/z46vdtg9/) - Also incorporates [weightless elements](https://weightless.dev)

## Bindings

ElemX binds expressions using observables and computeds to ReactiveElement attributes using direct attribute bindings and directive bindings.

### Attribute Bindings

Attribute bindings use `:` to denote an attribute of the element is bound to a reactive expression.

```js
// This will update the value of the input when `this.name` changes.
<input type="text" :value="this.name"/>
```

### Directive Bindings

Directive bindings use the `@` symbol. They are definable to perform specific customizable reactive actions to the element.

```js
// This will update the value of the input when `this.name` changes,
// *AND* `this.name` will be updated when the input value changes
<input type="text" @sync="this.name"/>
```

#### Conditional Rendering

```js
<template @if="this.isShown">
  <div>Conditionally shown</div>
</template>
```

#### List Rendering

```js
<template @each="this.todos" @as="todo">
  // `this` is still available here, and references the ReactiveElement
  // that defines this template
  <todo-item :item="context.todo"></todo-item>
</template>
```

#### Event Handling

You can handle events from elements using the `@on-<event-name>` syntax.

```js
<div @on-click="this.handleClick"></div>
```

Elements can also trigger custom events using `emitEvent` in a ReactiveElement.

```js
class MyElement extends ReactiveElement {
  emitCustomEvent() {
    this.emitEvent('customevent', {test: true})
  }
}
```

#### Input Bindings

```js
<input @sync="this.message" placeholder="edit me"/>
<p>Message is: {{ this.message }}</p>
```

Several other bindings are already pre-defined. See [pre-defined bindings](https://github.com/agquick/elemx.js/tree/master/src/bindings)

### Custom Bindings

Bindings are very easy to add. See below:

```js
import { bindings } from 'elemx';

let newBinding = {
  // how to access binding on element with '@'
  name: "my-binding",

  // whether to pass the evaluated binding express to the binding handlers
  evaluateValue: true

  // initialization
  init: ({element, rawValue, evalValue, customElement, context})=> {
    // init code here
  }

  // code that runs when attribute expression changes
  update: ({element, rawValue, evalValue, customElement, context})=> {
    // binding reaction here
  }
}

// register the binding with ElemX
bindings.registerBinding(newBinding);

// now use the binding in template HTML
class MyElement extends ReactiveElement {
  templateHTML() {
    return `
      <div @my-binding="this.value"></div>
    `;
  }
}
```
