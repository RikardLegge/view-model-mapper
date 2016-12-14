const parentDescriptor = Symbol(`parentDescriptor`);
const autoSetPath = Symbol(`autoSetPath`);
const unSetPath = Symbol(`unSetPath`);
const applyMiddleware = Symbol(`applyMiddleware`);

class Model extends EventSource {

  constructor(object){
    super();
    this.ignoreEqualSet = true;
    this.middleware = {};
    this.attachProperties(object);
  }

  [applyMiddleware](key, value){
    const middleware = this.middleware[key];
    return middleware
      ? middleware.reduce((value, method)=>method(value), value)
      : value;
  }

  [autoSetPath](model, key){
    if(model instanceof Model){
      model.path = {model:this, key};
    }
  }

  [unSetPath](model){
    if(model instanceof Model){
      model.path = null;
    }
  }

  addMiddleware(key, method){
    let middleware = this.middleware[key];
    if(!middleware){
      middleware = this.middleware[key] = [];
    }
    middleware.push(method);
  }

  addValueProperty(key, startValue){
    let value = startValue;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get() {return value},
      set(next) {
        next = this[applyMiddleware](key, next);

        if(this.ignoreEqualSet && value === next)
          return;

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
        assert(get, `A get method was not provided for ${key} in `, this);
        return get(this);
      },
      set(value) {
        assert(set, `A set method was not provided for ${key} in `, this);
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

  traversePath(path) {
    path = (path instanceof Array) ? path : [path];
    return path.reduce((obj, key)=>obj[key], this);
  }

}
Object.defineProperties(Model.prototype, {
  parent:{
    get(){
      return this[parentDescriptor]
        ? {model: this[parentDescriptor].model, key: this[parentDescriptor].key}
        : {};
    }
  },
  path:{
    get(){
      return this[parentDescriptor]
        ? [...this[parentDescriptor].model.path, this[parentDescriptor].key]
        : [];
    },
    set(path){
      this[parentDescriptor] = path || {};
    }
  }
});
