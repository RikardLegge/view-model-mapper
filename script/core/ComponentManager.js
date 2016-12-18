const componentData = Symbol(`componentData`);
const ComponentManager = (superClass) => class extends superClass {

  constructor(){
    super();
    this[componentData] = {};
  }

  static addComponent({name, set, get, methods={}}) {
    set = set || defaultSet;
    get = get || defaultGet;
    Object.defineProperty(this.prototype, name, {
      get(){
        return get.call(this, this[componentData], name);
      },
      set(value){
        return set.call(this, this[componentData], value, name);
      }
    });

    Object.entries(methods).forEach(([key, value])=>{
      this.prototype[key] = value;
    });

    function defaultSet(data, value, name){
      data[name] = value;
    }

    function defaultGet(data, name){
      return data[name];
    }
  }

  static removeComponent(componentDefinition) {

  }
};