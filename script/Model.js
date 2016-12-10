const parent = Symbol();

class Model extends EventSource {
  constructor(object){
    super();
    this.attachProperties(object);
  }

  addValueProperty(key, startValue){
    let value = startValue;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get() {return value},
      set(next) {
        value = next;
        this.trigger(key, value);
      }
    });

    if(startValue instanceof Model){
      startValue.setPath(this, key);
    }
  }

  addMethodProperty(key, get, set, dependencies=[]){
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get() {
        console.assert(get, `A get method was not provided for ${key} in `, this);
        return get(this);
      },
      set(value) {
        console.assert(set, `A set method was not provided for ${key} in `, this);
        set(this, value);
        this.trigger(key, get(this));
      }
    });

    dependencies.forEach((dependence)=>{
      this.listen(dependence, ()=>this.trigger(key, this[key]));
    });
  }

  getPath() {
    const parentModel = this[parent];
    return parentModel ? [...parentModel.model.getPath(), parentModel.key] : [];
  }

  getParent() {
    return this[parent]
      ? {model: this[parent].model, key: this[parent].key}
      : {};
  }

  setPath(model, key) {
    this[parent] = {model, key};
  }

  attachProperties(object){
    Object.entries(object).forEach(([key, value])=>{
      if(typeof value === 'function') {
        this.addMethodProperty(key, value);
      } else if (
        value &&
        typeof value === 'object' &&
        (typeof value.set === 'function' || typeof value.get === 'function')
      ) {
        this.addMethodProperty(key, value.get, value.set, value.dependencies);
      } else {
        this.addValueProperty(key, value);
      }
    });

  }
}

class EventBinding {
  constructor(model, signal, eventHandler){
    this.model = model;
    this.signal = signal;
    this.eventHandler = eventHandler;
  }

  trigger() {
    this.eventHandler(this.get(), this.model);
  }

  get() {
    return this.signal;
  }

  getKey() {
    return this.signal;
  }


  getPath(){
    const modelPath = this.model.getPath();
    return [...modelPath, this.getKey()];
  }

  setModel({model, signal}){
    this.model = model || this.model;
    this.signal = signal || this.signal;
  }
}

class ModelBinding {
  constructor(model, key, mapper=(value)=>value){
    this.model = model;
    this.key = key;
    this.mapper = mapper;
  }

  set(value){
    this.model[this.key] = this.mapper(value);
  }

  get(){
    const value = this.model[this.key];
    return this.mapper(value);
  }

  getKey() {
    return this.key;
  }

  listen(onChange) {
    this.__detachListeners();

    this.onChange = onChange;

    this.__attachListeners();
  }

  unListen(){
    this.__detachListeners();
  }

  getPath(){
    const modelPath = this.model.getPath();
    return [...modelPath, this.getKey()];
  }

  setModel({model, key, mapper, triggerEvent = true}={}){
    this.__detachListeners();

    this.model = model || this.model;
    this.key = key || this.key;
    this.mapper = mapper || this.mapper;

    this.__attachListeners();

    if(triggerEvent)
      this.onChange();
  }

  __attachListeners() {
    this.model.listen(this.key, this.onChange);
  }

  __detachListeners() {
    this.model.unListen(this.key, this.onChange);
  }



}

class ReflectModel {
  static getPaths(model, root=[]){
    return Object.entries(model).reduce((paths, [key, value])=>{
      let path = [...root, {model, key}];

      if(value instanceof Model){
        paths.push(...ReflectModel.getPaths(value, path))
      }
      paths.push(path);
      return paths;
    }, []);
  }
}