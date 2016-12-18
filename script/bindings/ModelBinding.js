const attachListeners = Symbol(`attachListeners`);
const detachListeners = Symbol(`detachListeners`);
const boundTriggerChange = Symbol(`detachListeners`);
const modelBindingData = Symbol(`modelBindingData`);

class ModelBinding {

  constructor() {
    this[boundTriggerChange] = this.trigger.bind(this);
    this[modelBindingData] = {};
  }

  trigger() {
    this[modelBindingData].onChange && this[modelBindingData].onChange();
  }

  dispose(){
    this[detachListeners]();
  }

  [attachListeners]() {
    if (this.model && this.key)
      this.model.listen(this.key, this[boundTriggerChange]);
  }

  [detachListeners]() {
    if (this.model && this.key)
      this.model.unListen(this.key, this[boundTriggerChange]);
  }

  get value(){
    const value = this.model[this.key];

    let result;
    if(this.middleware && this.middleware.get){
      const {method, properties} = this.middleware.get;
      const {execute, properties: defaultProperties} = method;
      result = execute(value, properties || defaultProperties);
    } else {
      result = value;
    }

    return result;
  }
  set value(value){
    let result;
    if(this.middleware && this.middleware.set){
      const {method, properties} = this.middleware.set;
      const {execute, properties: defaultProperties} = method;
      result = execute(value, properties || defaultProperties);
    } else {
      result = value;
    }

    this.model[this.key] = result;
  }

  get key(){return this[modelBindingData].key}
  set key(value){
    if(!this.model || !this.model.hasOwnProperty(value)){
      console.log(`No the key does not exists on the model`, this.model, value);
      return;
    }

    this[detachListeners]();

    this[modelBindingData].key = value;

    this[attachListeners]();
    this.trigger();
  }

  get model(){return this[modelBindingData].model}
  set model(value){
    this[detachListeners]();

    this[modelBindingData].model = value;

    if(value && !value.hasOwnProperty(this.key)){
      this.key = null;
      console.log(`The key was reset due to it not existing on the model`, value, this.key);
      return;
    }

    this[attachListeners]();
    this.trigger();
  }

  get middleware(){return this[modelBindingData].middleware}
  set middleware(value){
    this[modelBindingData].middleware = value;

    this.trigger();
  }

  set properties(value){
    this[detachListeners]();

    Object.entries(value).forEach(([key, value]) => {
      this[modelBindingData][key] = value;
    });

    this[attachListeners]();
    this.trigger();
  }

  set listen(value){
    this[detachListeners]();

    if (value) {
      this[modelBindingData].onChange = value;
      this[attachListeners]();
    }
  }

  get path() {
    const modelPath = this.model.path;
    return [...modelPath, this.key];
  }

}

