const checkboxView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => !!view.inputElement.checked,
  set: (view, value) => view.inputElement.checked = !!value,

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const buttonView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('click', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('click', view.eventListener)
});

const radioView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.checked = (value == view.inputElement.value),

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('change', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const textView = new ViewDefinition({
  construct: view => view.eventListener = view.viewChanged.bind(view),

  get: view => view.inputElement.value,
  set: (view, value) => view.inputElement.value = value,

  attach: view => {
    view.inputElement = view.element.querySelector('input');
    view.inputElement.addEventListener('input', view.eventListener);
  },
  detach: view => view.inputElement.removeEventListener('change', view.eventListener)
});

const labelView = new ViewDefinition({
  set: (view, value) => view.element.innerHTML = value,
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

ViewFactory.register('radio', radioTemplate, radioView);
ViewFactory.register('checkbox', checkboxTemplate, checkboxView);
ViewFactory.register('text', textTemplate, textView);
ViewFactory.register('label', labelTemplate, labelView);
ViewFactory.register('button', buttonTemplate, buttonView);
