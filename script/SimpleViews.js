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

const buttonTemplate = new Template(
  `<div>
    <input type="button"/>
  </div>
`);

const checkboxTemplate = new Template(
  `<div>
    <input type="checkbox"/>
  </div>
`);

const radioTemplate = new Template(
  `<div>
    <input type="radio" name="a"/>
  </div>
`);

const textTemplate = new Template(
  `<div class="#{name}Text">
    <input class="#{name}Text__input" type="text"/>
  </div>
`);

const labelTemplate = new Template(
  `<div class="#{name}Label"></div>
`);

const UI = {};
UI.default = {};

UI.default.radio = ViewFactory.from(radioTemplate, radioView);
UI.default.checkbox = ViewFactory.from(checkboxTemplate, checkboxView);
UI.default.text = ViewFactory.from(textTemplate, textView);
UI.default.label = ViewFactory.from(labelTemplate, labelView);
UI.default.button = ViewFactory.from(buttonTemplate, buttonView);
