const viewBindingData = Symbol(`viewBindingData`);
class ViewBinding {

  constructor({template, properties}) {
    this[viewBindingData] = {};
    this.template = template;
    this.templateProperties = properties;
  }

  replaceOldElement(element) {
    const oldElement = this.element;
    if (oldElement) {
      this.detachElement(this);
      delete oldElement.boundView;

      const parent = oldElement.parentNode;
      if (parent) {
        parent.replaceChild(element, oldElement)
      }
    }
  }

  migrateChildViews(ports) {
    const oldPorts = this[viewBindingData].ports || [];
    oldPorts.forEach((({children: connectors}, index) => {
      const port = ports[Math.min(index, ports.length - 1)];
      [...connectors].forEach(connector => port.appendChild(connector));
    }));
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

    this[viewBindingData].element = element;
    this[viewBindingData].ports = ports;

    element.boundView = this;
    this.attachElement(this);

    this.modelChanged();
  }

  viewSignal() {
    const binding = this.eventBinding;
    binding && binding.trigger();
  }

  viewChanged() {
    const binding = this.modelBinding;
    binding && (binding.value = this.getValue(this));
  }

  modelChanged() {
    const binding = this.modelBinding;
    const mutator = this.viewMutator;
    const setValue = this.setValue;

    if (binding) {
      setValue(this, binding.value);
      mutator && mutator(this, binding.model)
    }
  }

  getPortIndex(port) {
    return this[viewBindingData].ports.indexOf(port);
  }
}

Object.defineProperties(ViewBinding.prototype, {
  parentView: {
    get(){
      let currentElement = this.element;
      while (currentElement = currentElement.parentNode) {
        const view = currentElement.boundView;
        if (view) {
          return view;
        }
      }
    },
    set({view, port = 0}={}){
      if (view) {
        assert(view.ports[port], `The port ${port} does not exist on`, view);
        view.ports[port].appendChild(this.element);
      }
    }
  },
  parentPort: {
    get(){
      return this[viewBindingData].element.parentElement;
    }
  },
  element: {
    get(){
      return this[viewBindingData].element;
    }
  },
  ports: {
    get(){
      return this[viewBindingData].ports;
    }
  },

  viewMutator: {
    get(){
      return this[viewBindingData].viewMutator;
    },
    set(value){
      this[viewBindingData].viewMutator = value;

      if (this.viewMutator && this.modelBinding)
        this.viewMutator(this, this.modelBinding.model)
    }
  },
  modelBinding: {
    get(){
      return this[viewBindingData].modelBinding;
    },
    set(value){
      if (this.modelBinding) {
        this.modelBinding.listen = false;
      }

      this[viewBindingData].modelBinding = value;
      this[viewBindingData].modelBinding.listen = () => this.modelChanged();

      this.modelChanged();
    }
  },
  eventBinding: {
    get(){
      return this[viewBindingData].eventBinding;
    },
    set(value){
      this[viewBindingData].eventBinding = value;
    },
  },
});