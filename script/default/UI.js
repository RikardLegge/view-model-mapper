const checkboxView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => !!view.inputElement.checked,
  set: (view, value) => view.inputElement.checked = !!value,

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const buttonView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewSignal.bind(view),

  get: view => view.inputElement.value,

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('click', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('click', view.eventListener)
});

const radioView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.checked = (value == view.inputElement.value),

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const textView = new ViewBindingDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.value !== value && (view.inputElement.value = value),

  setProp: (view, prop, value) => !!value
    ? view.inputElement.setAttribute(prop, '')
    : view.inputElement.removeAttribute(prop),

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('input', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const labelView = new ViewBindingDefinition({
  set: (view, value) => view.element.innerHTML = value,
});

const buttonTemplate = new Template({name: 'Button'},
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

  constructor(element) {
    this.element = element;
    this.ports = element.querySelectorAll('[data-port]');

    if (this.ports.length === 0) {
      this.ports = [this.element];
    }
  }

  construct() {
    return {element: this.element, ports: this.ports};
  }

}

const defaultUI = new Registry('default', UI);

defaultUI.register('root', ViewFactory.from(new rawTemplate(document.body)));
defaultUI.register('radio', ViewFactory.from(radioTemplate, radioView));
defaultUI.register('checkbox', ViewFactory.from(checkboxTemplate, checkboxView));
defaultUI.register('text', ViewFactory.from(textTemplate, textView));
defaultUI.register('label', ViewFactory.from(labelTemplate, labelView));
defaultUI.register('button', ViewFactory.from(buttonTemplate, buttonView));
defaultUI.register('group', ViewFactory.from(groupTemplate));