const viewBindingData = Symbol(`viewBindingData`);
class ViewBinding {

  constructor({template, properties}){
    this[viewBindingData] = {};
    this.template = template;
    this.templateProperties = properties;
  }

  redrawElement(){
    const {element: viewElement, ports: elementPorts} = this.template.construct(this.templateProperties);

    const oldElement = this.element;
    if(oldElement){
      this.detachElement(this);
      delete oldElement.boundView;

      const parent = oldElement.parentNode;
      if(parent){
        parent.replaceChild(viewElement, oldElement)
      }
    }

    this[viewBindingData].element = viewElement;
    this[viewBindingData].ports = [...elementPorts];
    viewElement.boundView = this;
    this.attachElement(this);

    this.modelChanged();
  }

  viewSignal(){
    const binding = this.eventBinding;
    binding && binding.trigger();
  }

  viewChanged(){
    const binding = this.modelBinding;
    binding && (binding.value = this.getValue(this));
  }

  modelChanged(){
    const binding = this.modelBinding;
    const mutator = this.viewMutator;
    const setValue = this.setValue;

    if(binding) {
      setValue(this, binding.value);
      mutator && mutator(this, binding.model)
    }
  }

  getPortIndex(port){
    return this[viewBindingData].ports.indexOf(port);
  }
}

Object.defineProperties(ViewBinding.prototype, {
  parentView: {
    get(){
      let currentElement = this.element;
      while(currentElement = currentElement.parentNode){
        const view = currentElement.boundView;
        if(view) {
          return view;
        }
      }
    },
    set({view, port=0}={}){
      if(view){
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
  element:{
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

      if(this.viewMutator && this.modelBinding)
        this.viewMutator(this, this.modelBinding.model)
    }
  },
  modelBinding: {
    get(){
      return this[viewBindingData].modelBinding;
    },
    set(value){
      if(this.modelBinding){
        this.modelBinding.listen = false;
      }

      this[viewBindingData].modelBinding = value;
      this[viewBindingData].modelBinding.listen = ()=>this.modelChanged();

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