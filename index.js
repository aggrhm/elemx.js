import bindings from './src/binding_manager'
import utils from './src/utils'
import ReactiveElement from './src/reactive_element'

import bnd_sync from './src/bindings/sync'
import bnd_click from './src/bindings/click'
import bnd_each from './src/bindings/each'
import bnd_text from './src/bindings/text'
import bnd_on_return from './src/bindings/on-return'
import bnd_class from './src/bindings/class'
import bnd_if from './src/bindings/if'

bindings.registerBinding(bnd_text);
bindings.registerBinding(bnd_click);
bindings.registerBinding(bnd_sync);
bindings.registerBinding(bnd_each);
bindings.registerBinding(bnd_on_return);
bindings.registerBinding(bnd_class);
bindings.registerBinding(bnd_if);

export {
  ReactiveElement,
  bindings,
  utils
}
