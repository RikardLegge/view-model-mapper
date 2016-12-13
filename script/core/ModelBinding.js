const attachListeners = Symbol(`attachListeners`);
const detachListeners = Symbol(`detachListeners`);
const boundTriggerChange = Symbol(`detachListeners`);
const modelBindingData = Symbol(`modelBindingData`);

class ModelBinding {

  constructor(){
    this[boundTriggerChange] = this.trigger.bind(this);
    this[modelBindingData] = {};
  }

  trigger(){
    this[modelBindingData].onChange && this[modelBindingData].onChange();
  }

  [attachListeners]() {
    if(this.model)
      this.model.listen(this.key, this[boundTriggerChange]);
  }

  [detachListeners]() {
    if(this.model)
      this.model.unListen(this.key, this[boundTriggerChange]);
  }

}
Object.defineProperties(ModelBinding.prototype, {
  value: {
    get(){
      const value = this.model[this.key];
      return this.middlewere
        ? this.middlewere(value)
        : value;
    },
    set(value){
      this.model[this.key] = this.middlewere
        ? this.middlewere(value)
        : value;
    }
  },

  key: {
    get(){return this[modelBindingData].key},
    set(value){
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

      this[attachListeners]();
      this.trigger();
    }
  },
  middlewere: {
    get(){return this[modelBindingData].middlewere},
    set(value){
      this[modelBindingData].middlewere = value;

      this.trigger();
    }
  },

  properties: {
    get(){return model},
    set(value){
      this[detachListeners]();

      Object.entries(value).forEach(([key, value])=>{
        this[modelBindingData][key] = value;
      });

      this[attachListeners]();
      this.trigger();
    }
  },
  listen: {
    set(value){
      this[detachListeners]();

      if(value){
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
