const checkboxView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => !!view.inputElement.checked,
  set: (view, value) => view.inputElement.checked = !!value,

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const buttonView = new ViewDefinition({
  construct: view => view.eventListener = view.viewSignal.bind(view),

  get: view => view.inputElement.value,

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('click', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('click', view.eventListener)
});

const radioView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.checked = (value == view.inputElement.value),

  attach: view => {
    view.inputElement = view.getElement().querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const textView = new ViewDefinition({
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

const labelView = new ViewDefinition({
  set: (view, value) => view.getElement().innerHTML = value,
});

const buttonTemplate = new Template({name:'Button'},
  `<div class="container">
    <label class="hitbox">
      <input class="input" type="button"/>
      <div class="content">
        Press Me
      </div>
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
  `<div class="Label" data-port></div>
`);

const groupTemplate = new Template({},
  `<div class="Group__container">
    <div class="Group__content" data-port></div>
  </div>
`);

class rawTemplate {

  constructor(element){
    this.element = element;
    this.ports = $queryIncludeSelf(this.element, '[data-port]');

    if(this.ports.length === 0){
      this.ports = [this.element];
    }
  }

  construct(){
    return {element: this.element, ports: this.ports};
  }
}

const UI = {};
UI.default = {};

UI.default.root = ViewFactory.from(new rawTemplate(document.body));
UI.default.radio = ViewFactory.from(radioTemplate, radioView);
UI.default.checkbox = ViewFactory.from(checkboxTemplate, checkboxView);
UI.default.text = ViewFactory.from(textTemplate, textView);
UI.default.label = ViewFactory.from(labelTemplate, labelView);
UI.default.button = ViewFactory.from(buttonTemplate, buttonView);
UI.default.group = ViewFactory.from(groupTemplate);

const Functions = {};

UI.helloworld = {};
Functions.helloworld = {};

Functions.helloworld.invert = b=>!b;
Functions.helloworld.wrapLines = a=>a.join('<br>');
Functions.helloworld.setText1 = (key, model)=>model['pressed'] = 'Example text';
