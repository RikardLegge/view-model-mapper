const parent = Symbol();
const autoSetPath = Symbol();
const unSetPath = Symbol();

class Model extends EventSource {

  constructor(object){
    super();
    this.attachProperties(object);
  }

  [autoSetPath](model, key){
    if(model instanceof Model){
      model.setPath(this, key);
    }
  }

  [unSetPath](model){
    if(model instanceof Model){
      model.setPath(null, null);
    }
  }


  addValueProperty(key, startValue){
    let value = startValue;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get() {return value},
      set(next) {
        this[unSetPath](value);

        value = next;

        this[autoSetPath](value, key);
        this.trigger(key, value);
      }
    });

    this[autoSetPath](value, key);
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


  getPath() {
    return this[parent]
      ? [...this[parent].model.getPath(), this[parent].key]
      : [];
  }

  getParent() {
    return this[parent]
      ? {model: this[parent].model, key: this[parent].key}
      : {};
  }

  setPath(model, key) {
    this[parent] = {model, key};
  }

}

const model = Symbol();
const signal = Symbol();
const eventHandler = Symbol();

class EventBinding {

  constructor(modelData, eventSignal, signalHandler){
    this[model] = modelData;
    this[signal] = eventSignal;
    this[eventHandler] = signalHandler;
  }

  trigger() {
    this[eventHandler](this.get(), this[model]);
  }

  get() {
    return this[signal];
  }

  getKey() {
    return this[signal];
  }

  getPath(){
    const modelPath = this[model].getPath();
    return [...modelPath, this.getKey()];
  }

  setModel({modelData, eventSignal}){
    this[model] = modelData || this[model];
    this[signal] = eventSignal || this[signal];
  }
}

const mapper = Symbol();
const key = Symbol();
const onChange = Symbol();

const attachListeners = Symbol();
const detachListeners = Symbol();

class ModelBinding {

  constructor(modelData, propertyKey, dataMapper=(value)=>value){
    this[model] = modelData;
    this[key] = propertyKey;
    this[mapper] = dataMapper;
    this[onChange] = null;
  }

  set(value){
    this[model][this[key]] = this[mapper](value);
  }

  get(){
    const value = this[model][this[key]];
    return this[mapper](value);
  }

  getKey() {
    return this[key];
  }

  listen(onChangeListener) {
    this[detachListeners]();

    this[onChange] = onChangeListener;

    this[attachListeners]();
  }

  unListen(){
    this[detachListeners]();
  }

  getPath(){
    const modelPath = this[model].getPath();
    return [...modelPath, this.getKey()];
  }

  setModel({modelData, propertyKey, dataMapper, triggerEvent = true}={}){
    this[detachListeners]();

    this[model] = modelData || this[model];
    this[key] = propertyKey || this[key];
    this[mapper] = dataMapper || this[mapper];

    this[attachListeners]();

    if(triggerEvent)
      this[onChange]();
  }

  [attachListeners]() {
    this[model].listen(this[key], this[onChange]);
  }

  [detachListeners]() {
    this[model].unListen(this[key], this[onChange]);
  }

  static from(){

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