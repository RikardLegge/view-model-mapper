const viewDefinitionData = Symbol(`viewBindingData`);
class ViewDefinition extends Definition {

  constructor({template, properties}) {
    super();
    this[viewDefinitionData] = {};
    this[viewDefinitionData].template = template;
    this[viewDefinitionData].templateProperties = properties;
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

  viewSignal() {
    const binding = this.eventBinding;
    binding && binding.trigger();
  }

  viewChanged() {
    const binding = this.modelBinding;
    binding && (binding.value = this.getValue());
  }

  modelChanged() {
    const binding = this.modelBinding;
    const mutator = this.viewMutator;
    const setValue = this.setValue;

    if (binding) {
      setValue(binding.value);
      mutator && mutator.execute(this, binding.model, mutator.properties);
    }
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

  get viewMutator(){
    return this[viewDefinitionData].viewMutator;
  }
  set viewMutator(value){
    this[viewDefinitionData].viewMutator = value;

    if (this.viewMutator && this.modelBinding)
      this.viewMutator.execute(this, this.modelBinding.model, this.viewMutator.properties);
  }

  get modelBinding(){
    return this[viewDefinitionData].modelBinding;
  }
  set modelBinding(value){
    if (this.modelBinding) {
      this.modelBinding.listen = false;
    }

    this[viewDefinitionData].modelBinding = value;

    if(this[viewDefinitionData].modelBinding) {
      this[viewDefinitionData].modelBinding.listen = () => this.modelChanged();
    }

    this.modelChanged();
  }

  get eventBinding(){
    return this[viewDefinitionData].eventBinding;
  }
  set eventBinding(value){
    this[viewDefinitionData].eventBinding = value;
  }

  get template() {
    return this[viewDefinitionData].template;
  }
  set template(value) {
    this[viewDefinitionData].template = value;
  }

  get templateProperties() {
    return this[viewDefinitionData].templateProperties;
  }
  set templateProperties(value) {
    this[viewDefinitionData].templateProperties = value;
  }
}
