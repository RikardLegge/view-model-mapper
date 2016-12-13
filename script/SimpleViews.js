const checkboxView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => !!view.inputElement.checked,
  set: (view, value) => view.inputElement.checked = !!value,

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const buttonView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewSignal.bind(view),

  get: view => view.inputElement.value,

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('click', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('click', view.eventListener)
});

const radioView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.checked = (value == view.inputElement.value),

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const textView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.value = value,

  setProp: (view, prop, value) => !!value
    ? view.inputElement.setAttribute(prop, '')
    : view.inputElement.removeAttribute(prop),

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('input', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const labelView = new ViewBindingDefinition({
  set: (view, value) => view.getElement().innerHTML = value,
});

const buttonTemplate = new Template({name:'Button'},
  `<div class="container">
    <label class="hitbox">
      <input class="input" type="button"/>
      <div class="content" data-port></div>
    </label>
  </div>
`);

const checkboxTemplate = new Template({},
  `<div>
    <input type="checkbox"/>
  </div>
`);

const radioTemplate = new Template({},
  `<div>
    <input type="radio" name="a"/>
  </div>
`);

const textTemplate = new Template({},
  `<div class="Text">
    <input class="Text__input" type="text"/>
  </div>
`);

const labelTemplate = new Template({},
  `<div class="Label"></div>
`);

const groupTemplate = new Template({},
  `<div class="Group__container">
    <div class="Group__content" data-port></div>
  </div>
`);

class rawTemplate {

  constructor(element){
    this.element = element;
    this.ports = element.querySelectorAll('[data-port]');

    if(this.ports.length === 0){
      this.ports = [this.element];
    }
  }

  construct(){
    return {element: this.element, ports: this.ports};
  }

}

class Registry {
  constructor(key, parentRegistry) {
    if(key && parentRegistry){
      this.path = [parentRegistry.path, key];
      parentRegistry.register(key, this);
    } else {
      this.path = [];
    }
  }

  getKeyForProperty(property){
    const [key] = Object.entries(this).find(([key, value])=>value === property) || [];
    return key;
  }

  register(key, value) {
    this[key] = value;
    value.__path = this.getKeyForProperty(key);
    return value;
  }
}

const UI = new Registry();
const defaultUI = new Registry('default', UI);

defaultUI.register('root', ViewFactory.from(new rawTemplate(document.body)));
defaultUI.register('radio', ViewFactory.from(radioTemplate, radioView));
defaultUI.register('checkbox', ViewFactory.from(checkboxTemplate, checkboxView));
defaultUI.register('text', ViewFactory.from(textTemplate, textView));
defaultUI.register('label', ViewFactory.from(labelTemplate, labelView));
defaultUI.register('button', ViewFactory.from(buttonTemplate, buttonView));
defaultUI.register('group', ViewFactory.from(groupTemplate));

const Functions = {};

UI.helloworld = {};
Functions.helloworld = {};

Functions.helloworld.invert = b=>!b;
Functions.helloworld.wrapLines = a=>a.join('<br>');

Functions.helloworld.disableIfNull = (view, model, key)=> model[key] !== null ? view.enable() : view.disable();
Functions.helloworld.disableIfModelTextNull = (view, model)=>Functions.helloworld.disableIfNull(view, model, 'modelText');
Functions.helloworld.disableIfEventTextNull = (view, model)=>Functions.helloworld.disableIfNull(view, model, 'eventText');

Functions.helloworld.saveView = ()=>save();
Functions.helloworld.loadView = ()=>load();
Functions.helloworld.clearView = ()=>(localStorage.removeItem('state'), load());

Functions.helloworld.rewriteNullEventText = value=>
  value !== null ? value : `[EventBinding UNAVAILABLE]`;
Functions.helloworld.rewriteNullModelText = value=>
  value !== null ? value : `[ModelBinding UNAVAILABLE]`;

Functions.helloworld.setText1 = (key, model)=>model['pressed'] = 'Example text';
