class Template {

  constructor(template){
    this.template = template;
  }

  construct(properties){
    const template = this.compileTemplate(this.template, properties);
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.children[0];
  }

  compileTemplate(template, properties={}) {
    return template.replace(/(#\{([^}]*)})/g, (_, all, key)=>{
      return properties[key];
    })
  }

}

function noOp(){}

class ViewDefinition {

  constructor(viewDefinition){
    this.viewDefinition = viewDefinition;
  }

  construct(element, {eventBinding, modelBinding}={}){
    const vd = this.viewDefinition;
    const view = new View();

    view.construct = vd.construct || noOp;
    view.getValue = vd.get || noOp;
    view.setValue = vd.set || noOp;
    view.attachElement = vd.attach || noOp;
    view.detachElement = vd.detach || noOp;
    view.enable = vd.setProp ? ()=>vd.setProp(view, 'disabled', false) : noOp;
    view.disable = vd.setProp ? ()=>vd.setProp(view, 'disabled', true) : noOp;

    view.construct(view);
    eventBinding && view.setEventBinding(eventBinding);
    modelBinding && view.setModelBinding(modelBinding, false);
    view.setElement(element, false);
    view.modelChanged();

    return view;
  }
}

class View {

  setElement(element, triggerChange=true){
    if(this.element){
      let oldElement = this.element;
      this.detachElement(this);
      delete oldElement.__boundView;
    }

    this.element = element;
    element.__boundView = this;
    this.attachElement(this);

    if(triggerChange)
      this.modelChanged();
  }

  setEventBinding(eventBinding){
    this.eventBinding = eventBinding;
  }

  setModelBinding(modelBinding, triggerChange=true){
    if(this.modelBinding){
      this.modelBinding.unListen();
    }

    this.modelBinding = modelBinding;
    this.modelBinding.listen(()=>this.modelChanged());

    if(triggerChange) {
      this.modelChanged();
    }
  }

  viewSignal(){
    this.eventBinding.trigger();
  }

  viewChanged(){
    if(!this.modelBinding)
      return;

    this.modelBinding.set(this.getValue(this));
  }

  modelChanged(){
    if(!this.modelBinding)
      return;

    this.setValue(this, this.modelBinding.get());
  }

}

class ViewFactory {
  static create(type, bindings, properties, options={}){
    const [template, viewDefinition] = ViewFactory.types[type] || [];

    if(template){
      const element = template.construct(properties);
      const view = viewDefinition.construct(element, bindings);

      if(options.target){
        options.target.appendChild(element);
      }

      return view;
    }

  }

  static register(key, template, view){
    ViewFactory.types[key] = [template, view];
  }
}
ViewFactory.types = [];

