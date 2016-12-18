const modelData = Symbol(`modelData`);
const applyMiddleware = Symbol(`applyMiddleware`);
const autoSetPath = Symbol(`autoSetPath`);
const unSetPath = Symbol(`unSetPath`);

class ModelDefinition extends EventSource(Definition) {

  constructor(object) {
    super();
    this[modelData] = {};
    this.ignoreEqualSet = true;
    this.middleware = {};
    this.attachProperties(object);
  }

  [applyMiddleware](key, value) {
    const middleware = this.middleware[key];
    return middleware
      ? middleware.reduce((value, method) => method(value), value)
      : value;
  }

  [autoSetPath](model, key) {
    if (model instanceof ModelDefinition) {
      model.path = {model: this, key};
    }
  }

  [unSetPath](model) {
    if (model instanceof ModelDefinition) {
      model.path = null;
    }
  }

  addMiddleware(key, method) {
    let middleware = this.middleware[key];
    if (!middleware) {
      middleware = this.middleware[key] = [];
    }
    middleware.push(method);
  }

  addValueProperty(key, startValue) {
    let value = startValue;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get() {return value},
      set(next) {
        next = this[applyMiddleware](key, next);

        if (this.ignoreEqualSet && value === next)
          return;

        this[unSetPath](value);

        value = next;

        this[autoSetPath](value, key);
        this.trigger(key, value);
      }
    });

    this[autoSetPath](value, key);
  }

  addMethodProperty(key, get, set, dependencies = []) {
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

    dependencies.forEach((dependence) => {
      this.listen(dependence, () => this.trigger(key, this[key]));
    });
  }

  attachProperties(object) {
    Object.entries(object).forEach(([key, value]) => {
      if (typeof value === 'function') {
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
    return path.reduce((obj, key) => obj[key], this);
  }

  get parent(){
    const parentDescriptor = this[modelData].parentDescriptor;
    return parentDescriptor
      ? {model: parentDescriptor.model, key: parentDescriptor.key}
      : {};
  }

  get path(){
    const parentDescriptor = this[modelData].parentDescriptor;
    return parentDescriptor
      ? [...parentDescriptor.model.path, parentDescriptor.key]
      : [];
  }
  set path(path){
    this[modelData].parentDescriptor = path || {};
  }

}

ModuleSerializer.add('models', ({models, module: thisModule}, {modules})=>{
  return models.getList()
    .map((model) => {
      const ignoredProperties = ['ignoreEqualSet', 'middleware'];
      const {id, tag: name} = model.meta;
      const aliases = [];
      const middleware = Object.entries(model.middleware).reduce((middleware, [key, values]) => {
        middleware.push(...values.map(value => ({key, middleware: {path: value.execute.__path, properties: value.properties}})));
        return middleware;
      }, []);
      const properties = Object.entries(model).reduce((properties, [key, value]) => {
        if (ignoredProperties.indexOf(key) === -1) {
          if (value instanceof ModelDefinition) {
            aliases.push({key, value: {type: 'model', id: value.meta.id}});
          } else if (value instanceof ViewDefinition) {
            const meta = value.meta;
            const module = modules.findByView(value);
            const moduleId = thisModule !== module
              ? module.header.id
              : null;

            aliases.push({key, value: {type: 'view', id: meta.id, moduleId}});
          } else if (value && (typeof value === 'object') && value.constructor === Object) {
            console.error(`Value not serializable`, value);
          } else {
            properties[key] = value;
          }
        }
        return properties;
      }, {});
      return {id, name, properties, aliases, middleware};
    });
});