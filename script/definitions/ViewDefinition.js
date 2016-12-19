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

  get children(){
    return this.ports.map(port=>{
      return [...port.children].map(child=>{
        return child.boundView;
      })
    });
  }

  get ports(){
    return this[viewDefinitionData].ports;
  }

  isDescendantOf(parent) {
    let child = this.element;
    while (child != null) {
      if (child.boundView == parent) {
        return true;
      }
      child = child.parentNode;
    }
    return false;
  }
}

ModuleParser.add('views', ({views: obj})=>{
  const viewsSet = {};
  const unattachedViews = [];

  obj.sort((a, b) => a.index - b.index).forEach(({
    path, properties = {}, id,
    parentView: parentViewDef
  }) => {
    properties.name = properties.name === undefined ? 'default' : properties.name;

    const viewFactory = ModuleParser.reducePath(UI, path);
    const view = viewFactory.create({properties});

    const meta = {id, view};
    view.meta = meta;

    viewsSet[id] = meta;

    if (parentViewDef)
      unattachedViews.push({view, id: parentViewDef.id, port: parentViewDef.port});
  });

  unattachedViews.forEach(({view, id, port}) => {
    assert(viewsSet[id].view, `No view found when attaching view to parent ${id}`, view, port);
    view.parentView = {view: viewsSet[id].view, port};
  });

  const views = new ViewManager(Object.values(viewsSet));
  return {data: views};
});

ModuleSerializer.add('views', ({views})=>{
  return views.data.map(({id, view}) => {
    const properties = view.templateProperties;
    const path = view.__path;
    const element = view.element;
    const index = [...element.parentNode.children].indexOf(element);

    let parentView;
    let parentViewInstance = view.parentView;
    if (parentViewInstance) {
      const {id} = parentViewInstance.meta;
      const port = parentViewInstance.getPortIndex(view.parentPort);

      assert(port >= 0, `Unable to find element port index, please put the following element in a dom node with a [data-port] attribute`, view.element);

      parentView = {id, port};
    }

    return {id, index, path, parentView, properties};
  });
});