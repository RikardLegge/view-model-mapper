const template = Symbol();

class Template {

  constructor(templateString){
    this[template] = templateString;
  }

  construct(properties){
    const templateString = this.compileTemplate(this[template], properties);
    const element = document.createElement("div");

    element.innerHTML = templateString;

    return element.children[0];
  }

  compileTemplate(templateString, properties={}) {
    return templateString.replace(/(#\{([^}]*)})/g, (_, all, key) => properties[key] )
  }

}

const viewDefinition = Symbol();
const noOp = ()=>{};
const notYetImplemented = ()=>{throw "Not yet implemented"};

class ViewDefinition {

  constructor(definition = {}){
    this[viewDefinition] = definition;
  }

  construct(element, {eventBinding, modelBinding}={}){
    const vd = this[viewDefinition];
    const view = new ViewBinding();

    view.construct = vd.construct || noOp;
    view.getValue = vd.get || noOp;
    view.setValue = vd.set || noOp;
    view.attachElement = vd.attach || noOp;
    view.detachElement = vd.detach || noOp;
    view.enable = vd.setProp ? ()=>vd.setProp(view, 'disabled', false) : notYetImplemented;
    view.disable = vd.setProp ? ()=>vd.setProp(view, 'disabled', true) : notYetImplemented;

    view.construct(view);
    eventBinding && view.setEventBinding(eventBinding);
    modelBinding && view.setModelBinding(modelBinding, false);
    view.setElement(element, false);
    view.modelChanged();

    return view;
  }
}

const element = Symbol();
const eventBinding = Symbol();
const modelBinding = Symbol();

class ViewBinding {

  setElement(viewElement, triggerChange=true){
    const oldElement = this[element];
    if(oldElement){
      this.detachElement(this);
      delete oldElement.boundView;
    }

    this[element] = viewElement;
    viewElement.boundView = this;
    this.attachElement(this);

    if(triggerChange)
      this.modelChanged();
  }

  getElement(){
    return this[element];
  }

  setEventBinding(binding){
    this[eventBinding] = binding;
  }

  setModelBinding(binding, triggerChange=true){
    if(this[modelBinding]){
      this[modelBinding].unListen();
    }

    this[modelBinding] = binding;
    this[modelBinding].listen(()=>this.modelChanged());

    if(triggerChange) {
      this.modelChanged();
    }
  }

  getEventBinding(){
    return this[eventBinding];
  }

  getModelBinding(){
    return this[modelBinding];
  }

  viewSignal(){
    this[eventBinding].trigger();
  }

  viewChanged(){
    if(!this[modelBinding])
      return;

    this[modelBinding].set(this.getValue(this));
  }

  modelChanged(){
    if(!this[modelBinding])
      return;

    this.setValue(this, this[modelBinding].get());
  }

  setParentView(view){
    if(view){
      view.getElement().appendChild(this[element]);
    }
  }
}

class ViewFactory {

  constructor(template, viewDefinition){
    this.template = template;
    this.viewDefinition = viewDefinition;
  }

  create(options={}){
    const bindings = {modelBinding: options.modelBinding, eventBinding: options.eventBinding};
    const properties = options.properties;
    const element = this.template.construct(properties);
    const view = this.viewDefinition.construct(element, bindings);

    view.setParentView(options.parentView);

    return view;
  }

  static from(template, viewDefinition){
    return new ViewFactory(template, viewDefinition);
  }
}
