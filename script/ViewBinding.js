

const element = Symbol();
const ports = Symbol();
const eventBinding = Symbol();
const modelBinding = Symbol();
const viewMutator = Symbol();

class ViewBinding {

  constructor({template, properties}){
    this.template = template;
    this.templateProperties = properties;
  }

  redrawElement(){
    const {element: viewElement, ports: elementPorts} = this.template.construct(this.templateProperties);

    const oldElement = this[element];
    if(oldElement){
      this.detachElement(this);
      delete oldElement.boundView;

      const parent = oldElement.parentNode;
      if(parent){
        parent.replaceChild(viewElement, oldElement)
      }
    }

    this[element] = viewElement;
    this[ports] = elementPorts;
    viewElement.boundView = this;
    this.attachElement(this);

    this.modelChanged();
  }

  getElement(){
    return this[element];
  }


  setEventBinding(binding){
    this[eventBinding] = binding;
  }

  getEventBinding(){
    return this[eventBinding];
  }


  setModelBinding(binding, triggerChange=true){
    if(this[modelBinding]){
      this[modelBinding].listen = false;
    }

    this[modelBinding] = binding;
    this[modelBinding].listen = ()=>this.modelChanged();

    if(triggerChange) {
      this.modelChanged();
    }
  }

  getModelBinding(){
    return this[modelBinding];
  }


  setViewMutator(viewMutatorMethod, triggerChange=true) {
    this[viewMutator] = viewMutatorMethod;

    if(triggerChange && this[modelBinding])
      this[viewMutator](this, this[modelBinding].model)
  }

  getViewMutator(){
    return this[viewMutator];
  }


  viewSignal(){
    if(!this[eventBinding])
      return;

    this[eventBinding].trigger();
  }

  viewChanged(){
    if(!this[modelBinding])
      return;

    this[modelBinding].value = this.getValue(this);
  }

  modelChanged(){
    if(!this[modelBinding])
      return;

    this.setValue(this, this[modelBinding].value);
    this[viewMutator] && this[viewMutator](this, this[modelBinding].model)
  }


  setParentView(view, port=0){
    if(view){
      console.assert(view[ports][port], `The port ${port} does not exist on`, view);
      view[ports][port].appendChild(this[element]);
    }
  }

  getParentView(){
    let currentElement = this[element];
    while(currentElement = currentElement.parentNode){
      const view = currentElement.boundView;
      if(view) {
        return view
      }
    }
  }

  getParentPort(){
    return this[element].parentNode;
  }


  getPortIndex(port){
    return [...this[ports]].indexOf(port);
  }
}

