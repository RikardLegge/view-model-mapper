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
  construct: view => {
    view.eventListener = view.viewChanged.bind(view);
  },

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.checked = (value == view.inputElement.value),

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => {
    view.inputElement.removeEventListener('change', view.eventListener);
  }
});

const textView = new ViewBindingDefinition({
  construct: view => {
    view.eventListener = view.viewChanged.bind(view);
    view.signalListener = (e)=> {
      if(e.keyCode === 13)
        view.viewSignal();
    }
  },

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.value !== value && (view.inputElement.value = value),

  setProp: (view, prop, value) => !!value
    ? view.inputElement.setAttribute(prop, '')
    : view.inputElement.removeAttribute(prop),

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('input', view.eventListener);
    view.inputElement.addEventListener('keypress', view.signalListener);
  },
  detach: view => {
    view.inputElement.removeEventListener('input', view.eventListener);
    view.inputElement.removeEventListener('keypress', view.signalListener);
  }
});

const labelView = new ViewBindingDefinition({
  set: (view, value) => view.element.innerHTML = value,
  setClass: ({element: {classList}}, cls, add)=>add
    ? !classList.contains(cls) && classList.add(cls)
    : classList.contains(cls) && classList.remove(cls),
});

const groupView = new ViewBindingDefinition({
  setClass: ({element: {classList}}, cls, add)=>add
    ? !classList.contains(cls) && classList.add(cls)
    : classList.contains(cls) && classList.remove(cls),
});

const buttonTemplate = new Template({name: 'Button'},
  `<div class="container">
    <label class="hitbox">
      <input class="input" type="button"/>
      <div class="content" data-port></div>
    </label>
  </div>
`);

const checkboxTemplate = new Template({name: 'Checkbox'},
  `<div class="container">
    <input class="input" type="checkbox"/>
  </div>
`);

const radioTemplate = new Template({name: 'Radio'},
  `<div class="container">
    <input class="input" type="radio" name="#{group}"/>
  </div>
`);

const textTemplate = new Template({name: 'Text'},
  `<div class="container">
    <input class="input" type="text"/>
  </div>
`);

const labelTemplate = new Template({name: 'Label'},
  `<div class="content"></div>
`);

const groupTemplate = new Template({name: 'Group'},
  `<div class="container">
    <div class="content" data-port></div>
  </div>
`);

const rawTemplate = {
  construct({selector}) {
    const element = document.querySelector(selector);

    assert(element, `No element found for the selector "${selector}"`);

    let ports = element.querySelectorAll('[data-port]');

    if(ports.length === 0){
      ports = [element];
    }

    return {element, ports};
  },

  remove() { }
};

const defaultUI = new Registry('default', UI);

defaultUI.register('root', ViewFactory.from(rawTemplate));
defaultUI.register('radio', ViewFactory.from(radioTemplate, radioView));
defaultUI.register('checkbox', ViewFactory.from(checkboxTemplate, checkboxView));
defaultUI.register('text', ViewFactory.from(textTemplate, textView));
defaultUI.register('label', ViewFactory.from(labelTemplate, labelView));
defaultUI.register('button', ViewFactory.from(buttonTemplate, buttonView));
defaultUI.register('group', ViewFactory.from(groupTemplate, groupView));