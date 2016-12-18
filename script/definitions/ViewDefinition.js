const viewDefinitionData = Symbol(`viewBindingData`);

class ViewDefinition extends ComponentManager(Definition) {

  constructor({template, properties}) {
    super();

    this[viewDefinitionData] = { };
    this.template = template;
    this.templateProperties = properties;
  }

  replaceOldElement(element) {
    const oldElement = this.element;
    if (oldElement) {
      this.detachElement();
      delete oldElement.boundView;

      const parent = oldElement.parentNode;
      if (parent) {
        parent.replaceChild(element, oldElement)
      }
    }
  }

  migrateChildViews(ports) {
    const oldPorts = this[viewDefinitionData].ports || [];
    oldPorts.forEach((({children: connectors}, index) => {
      const port = ports[Math.min(index, ports.length - 1)];
      [...connectors].forEach(connector => port.appendChild(connector));
    }));
  }

  getTemplateNamespace() {
    return this.template.getNamespace(this.templateProperties);
  }

  remove(){
    const childViews = [...this.element.querySelectorAll('*')]
      .filter(el=>!!el.boundView)
      .map(el=>el.boundView);

    this.template.remove
      ? this.template.remove()
      : this[viewDefinitionData].element.remove();

    return childViews;
  }

  redrawElement() {
    const {element, ports: portList} = this.template.construct(this.templateProperties);
    const ports = [...portList];

    const activeElement = document.activeElement;

    this.replaceOldElement(element);
    this.migrateChildViews(ports);

    if (activeElement !== document.activeElement) {
      activeElement.focus();
    }

    this[viewDefinitionData].element = element;
    this[viewDefinitionData].ports = ports;

    element.boundView = this;
    this.attachElement();

    this.modelChanged();
  }

  getPortIndex(port) {
    return this[viewDefinitionData].ports.indexOf(port);
  }

  get parentView(){
    let currentElement = this.element;
    while (currentElement = currentElement.parentNode) {
      const view = currentElement.boundView;
      if (view) {
        return view;
      }
    }
  }
  set parentView(value){
    const {view, port = 0} = value || {};
    if (view) {
      assert(view.ports[port], `The port ${port} does not exist on`, view);
      view.ports[port].appendChild(this.element);
    }
  }

  get parentPort(){
    return this[viewDefinitionData].element.parentElement;
  }

  get element(){
    return this[viewDefinitionData].element;
  }

  get ports(){
    return this[viewDefinitionData].ports;
  }
}
