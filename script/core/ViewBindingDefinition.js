const notYetImplemented = () => {throw "Not yet implemented"};

const defaultViewDefinition = {
  methods: {
    construct: (vd, view)=> vd.construct
      ? vd.construct(view)
      : null,

    getValue: (vd, view) => vd.get
      ? vd.get(view)
      : null,
    setValue: (vd, view, value) => vd.set
      ? vd.set(view, value)
      : null,

    attachElement: (vd, view) => vd.attach
      ? vd.attach(view)
      : null,
    detachElement: (vd, view) => vd.detach
      ? vd.detach(view)
      : null,

    enable: (vd, view) => vd.setProp
      ? vd.setProp(view, 'disabled', false)
      : notYetImplemented(),
    disable: (vd, view) => vd.setProp
      ? vd.setProp(view, 'disabled', true)
      : notYetImplemented(),

    show: (vd, view) => vd.setClass
      ? vd.setClass(view, `${view.getTemplateNamespace()}--show`, true)
      : notYetImplemented(),
    hide: (vd, view) => vd.setClass
      ? vd.setClass(view, `${view.getTemplateNamespace()}--show`, false)
      : notYetImplemented(),
  }
};

class ViewBindingDefinition {

  constructor(viewDefinition = {}, parentViewDefinition = defaultViewDefinition) {
    this.viewDefinition = viewDefinition;
    this.parentViewDefinition = parentViewDefinition;
  }

  construct(viewProperties) {
    const parentMethods = this.parentViewDefinition.methods;
    const methods = this.viewDefinition.methods || {};
    const vd = this.viewDefinition;
    const view = new ViewBinding(viewProperties);

    Object.entries(parentMethods).forEach(([key, value])=>view[key] = value.bind(null, vd, view));
    Object.entries(methods).forEach(([key, value])=>view[key] = value.bind(null, vd, view));

    view.construct();
    view.redrawElement();

    return view;
  }
}