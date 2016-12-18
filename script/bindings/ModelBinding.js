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

ModuleParser.add('moduleBindingMiddleware', ({}, {parsed: {middleware}, unresolved: {unresolvedModelBindingMiddleware}})=>{
  if(!middleware || !unresolvedModelBindingMiddleware)
    return false;

  unresolvedModelBindingMiddleware.forEach(({modelBinding, middleware: middlewareDef})=>{
    const middleware = {get:null, set: null};
    const get = middlewareDef.get;
    const set = middlewareDef.set;

    assert(get || set, `A get and or a set method is required for a model binding to be resolved`);

    if(get)
      middleware.get = createMethod(get);

    if(set)
      middleware.set = createMethod(set);

    modelBinding.middleware = middleware
  });

  function createMethod({id, properties}){
    const method = middleware.findById(id);

    assert(method, `No middleware method found for id`, id);

    return {method: method, properties: properties};
  }
});

ModuleParser.add('modelBindings', ({modelBindings: obj}, {parsed:{models, views}})=>{
  if(!models || !views)
    return false;

  const unresolvedModelBindingMiddleware = [];

  obj.forEach(({view:{id: viewId}, model:{id: modelId, path: key}, middleware}) => {
    const model = models.findById(modelId);
    const view = views.findById(viewId);

    assert(view, `No view found when parsing model bindings`);
    assert(model, `Model "${modelId}" not connected using view/model binding`, view, key);

    const modelBinding = new ModelBinding();
    modelBinding.properties = {model, key};
    view.modelBinding = modelBinding;

    if(middleware)
      unresolvedModelBindingMiddleware.push({modelBinding, middleware});
  });

  return {unresolved: {unresolvedModelBindingMiddleware}};
});

ModuleSerializer.add('modelBindings', ({views})=>{
  return views.getList()
    .filter(view => !!view.modelBinding)
    .map(view => {
      const modelBinding = view.modelBinding;
      const model = modelBinding.model;
      const middlewareInstance = modelBinding.middleware;

      const {id: viewId} = view.meta;
      const {id: modelId} = model.meta;
      const path = modelBinding.key;

      let middleware;
      if(middlewareInstance){
        middleware = {};

        const get = middlewareInstance.get;
        if(get){
          const {method:{meta:{id}}, properties} = get;
          middleware.get = {id, properties}
        }

        const set = middlewareInstance.set;
        if(set){
          const {method:{meta:{id}}, properties} = set;
          middleware.set = {id, properties}
        }
      }

      return {view: {id: viewId}, model: {id: modelId, path}, middleware};
    });
});

ViewDefinition.addComponent({
  name: 'modelBinding',
  set: function(data, value) {
    if (data.modelBinding) {
      data.modelBinding.listen = false;
    }

    data.modelBinding = value;

    if(data.modelBinding) {
      data.modelBinding.listen = () => this.modelChanged();
    }

    this.modelChanged();
  },
  methods: {
    viewChanged: function() {
      const binding = this.modelBinding;

      if (binding)
        binding.value = this.getValue();
    },
    modelChanged: function() {
      const binding = this.modelBinding;
      const mutator = this.viewMutator;
      const setValue = this.setValue;

      if (binding) {
        setValue(binding.value);

        if(mutator)
          mutator.execute(this, binding.model, mutator.properties);
      }
    }
  }
});
