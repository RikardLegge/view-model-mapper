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

}
Object.defineProperties(ModelBinding.prototype, {
  value: {
    get(){
      const value = this.model[this.key];
      return this.middleware
        ? this.middleware.execute(value, this.middleware.properties)
        : value;
    },
    set(value){
      this.model[this.key] = this.middleware
        ? this.middleware.execute(value, this.middleware.properties)
        : value;
    }
  },

  key: {
    get(){return this[modelBindingData].key},
    set(value){
      if(!this.model || !this.model.hasOwnProperty(value)){
        console.log(`No the key does not exists on the model`, this.model, value);
        return;
      }

      this[detachListeners]();

      this[modelBindingData].key = value;

      this[attachListeners]();
      this.trigger();
    }
  },
  model: {
    get(){return this[modelBindingData].model},
    set(value){
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
  },
  middleware: {
    get(){return this[modelBindingData].middleware},
    set(value){
      this[modelBindingData].middleware = value;

      this.trigger();
    }
  },

  properties: {
    get(){return model},
    set(value){
      this[detachListeners]();

      Object.entries(value).forEach(([key, value]) => {
        this[modelBindingData][key] = value;
      });

      this[attachListeners]();
      this.trigger();
    }
  },
  listen: {
    set(value){
      this[detachListeners]();

      if (value) {
        this[modelBindingData].onChange = value;
        this[attachListeners]();
      }
    }
  },
  path: {
    get() {
      const modelPath = this.model.path;
      return [...modelPath, this.key];
    }
  }
});
