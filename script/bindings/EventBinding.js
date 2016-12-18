class EventBinding {

  constructor(model, signalHandler) {
    this.model = model;
    this.signalHandler = signalHandler;
  }

  dispose(){ }

  trigger() {
    this.signalHandler.execute(this.model, this.signalHandler.properties);
  }

  get path(){ return this.signalHandler.execute.__path;}
}

ModuleParser.add('eventBindings', ({eventBindings: obj}, {parsed:{models, views}})=>{
  if(!models || !views)
    return false;

  obj.forEach(({view:{id: viewId}, model:{id: modelId}, signalHandler: signalHandlerDef, }) => {
    const model = models.findById(modelId);
    const view = views.findById(viewId);

    let signalHandler;
    if(signalHandlerDef){
      signalHandler = {
        execute: ModuleParser.reducePath(Functions, signalHandlerDef.path),
        properties: signalHandlerDef.properties
      }
    }

    const eventBinding = new EventBinding(model, signalHandler);

    assert(view, `No view found when parsing event bindings`);
    signalHandler || console.warn(`Signal handler not connected to view`, view, signalHandlerDef);
    model || console.warn(`Model "${modelId}" not connected to view`, view);

    view.eventBinding = eventBinding;
  });

});

ModuleSerializer.add('eventBindings', ({views})=>{
  return views.getList()
    .filter(view => !!view.eventBinding)
    .map(view => {
      const eventBinding = view.eventBinding;
      const model = eventBinding.model;
      const signalHandlerInstance = eventBinding.signalHandler;

      const {id: viewId} = view.meta;
      const {id: modelId} = model.meta;

      let signalHandler;
      if(signalHandlerInstance){
        signalHandler = {
          path: signalHandlerInstance.execute.__path,
          properties: signalHandlerInstance.properties
        }
      }

      return {view: {id: viewId}, model: {id: modelId}, signalHandler};
    });
});

ViewDefinition.addComponent({
  name: 'eventBinding',
  methods: {
    viewSignal: function() {
      const binding = this.eventBinding;
      binding && binding.trigger();
    }
  },
});