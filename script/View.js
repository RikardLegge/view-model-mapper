const template = Symbol();
const properties = Symbol();

class Template {

  constructor(templateProperties, templateString){
    this[properties] = templateProperties;
    this[template] = templateString;
  }

  construct(properties){
    const templateString = this.compileTemplate(this[template], properties);
    const elementConstructor = document.createElement("div");
    elementConstructor.innerHTML = templateString;

    const ports = elementConstructor.querySelectorAll('[data-port]');
    const element = elementConstructor.children[0];

    return {element, ports};
  }

  precompileTemplate(templateString, namespace){
    const type = this[properties].name ? this[properties].name + '__' : '';
    return templateString
      .replace(/class=(['"])([^'"]*)\1/g,
        (_, __, all, key) => all
          .split(' ')
            .filter(cls=>!!cls.trim())
            .map(cls=>`class="${namespace}${type}${cls}"`)
          .join(' '));
  }

  compileTemplate(templateString, properties={}) {
    const namespace = properties.name || '';
    return this.precompileTemplate(templateString, namespace)
     .replace(/(#\{([^}]*)})/g,
       (_, all, key) => properties[key] || '' )
  }

}

const viewDefinition = Symbol();
const noOp = ()=>{};
const notYetImplemented = ()=>{throw "Not yet implemented"};

class ViewDefinition {

  constructor(definition = {}){
    this[viewDefinition] = definition;
  }

  construct(element, {ports, eventBinding, modelBinding}={}){
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
    view.setElement(element, ports, false);
    eventBinding && view.setEventBinding(eventBinding);
    modelBinding && view.setModelBinding(modelBinding, false);
    view.modelChanged();

    return view;
  }
}

const element = Symbol();
const ports = Symbol();
const eventBinding = Symbol();
const modelBinding = Symbol();
const viewMutator = Symbol();

class ViewBinding {

  setElement(viewElement, elementPorts=[], triggerChange=true){
    const oldElement = this[element];
    if(oldElement){
      this.detachElement(this);
      delete oldElement.boundView;
    }

    this[element] = viewElement;
    this[ports] = elementPorts;
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

  setViewMutator(viewMutatorMethod, triggerChange=true) {
    this[viewMutator] = viewMutatorMethod;

    if(triggerChange && this[modelBinding])
      this[viewMutator](this, this[modelBinding].getModel())
  }

  viewSignal(){
    if(!this[eventBinding])
      return;

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
    this[viewMutator] && this[viewMutator](this, this[modelBinding].getModel())
  }

  setParentView(view, port=0){
    if(view){
      console.assert(view[ports][port], `The port ${port} does not exist on`, view);
      view[ports][port].appendChild(this[element]);
    }
  }

  getPortIndex(port){
    return [...this[ports]].indexOf(port);
  }

  getParentPort(){
    return this[element].parentNode;
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
}

const defaultViewDefinition = new ViewDefinition();
class ViewFactory {

  constructor(template, viewDefinition=defaultViewDefinition){
    this.template = template;
    this.viewDefinition = viewDefinition;
  }

  create(options={}){
    const properties = options.properties;
    const {element, ports} = this.template.construct(properties);
    const definitionProperties = {
      modelBinding: options.modelBinding,
      eventBinding: options.eventBinding,
      ports
    };
    const view = this.viewDefinition.construct(element, definitionProperties);

    view.setParentView(options.parentView);

    return view;
  }

  static from(template, viewDefinition){
    return new ViewFactory(template, viewDefinition);
  }
}

function $queryIncludeSelf(element, query){
  const includeSelf = [...element.parentNode.querySelectorAll(query)].indexOf(element) !== -1;
  const self = includeSelf ? [element] : [];
  return [...self, ...element.querySelectorAll(query)];
}