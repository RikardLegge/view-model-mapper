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

  addMethodProperty(key, get, set){
    Object.defineProperty(this, key, {
      enumerable: false,
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
  }

  getPath() {
    const parentModel = this[parent];
    return parentModel ? [...parentModel.modelBinding.getPath(), parentModel.key] : [];
  }

  setPath(modelBinding, key) {
    this[parent] = {modelBinding, key};
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
        this.addMethodProperty(key, value.get, value.set);
      } else {
        this.addValueProperty(key, value);
      }
    });

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

  getPath(){
    const modelPath = this.model.getPath();
    return [...modelPath, this.key];
  }

  listen(onChange) {
    this.model.unListen(this.key, this.onChange);

    this.onChange = onChange;
    this.model.listen(this.key, onChange);
  }

  unListen(){
    this.model.unListen(this.key, this.onChange);
  }

  setMapper(mapper){
    this.mapper = mapper;
    this.onChange();
  }

  setModel(model, key){
    this.unListen();

    this.model = model;
    this.key = key || this.key;

    this.listen(this.onChange);
    this.onChange();
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