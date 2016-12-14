class Registry {
  constructor(key, parentRegistry) {
    if(key && parentRegistry){
      parentRegistry.register(key, this);
    } else {
      this.__path = [];
    }
  }

  register(key, value) {
    this[key] = value;
    value.__path = [...this.__path, key];
    return value;
  }
}
