class Registry {
  constructor(key, parentRegistry) {
    if(key && parentRegistry){
      this.path = [parentRegistry.path, key];
      parentRegistry.register(key, this);
    } else {
      this.path = [];
    }
  }

  getKeyForProperty(property){
    const [key] = Object.entries(this).find(([key, value])=>value === property) || [];
    return key;
  }

  register(key, value) {
    this[key] = value;
    value.__path = this.getKeyForProperty(key);
    return value;
  }
}
