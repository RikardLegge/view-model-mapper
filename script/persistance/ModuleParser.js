class ModuleParser {

  parse(obj) {
    const header = this.parseHeader(obj.header);
    const {models, unresolvedModelAliases} = this.parseModels(obj.models);
    const views = this.parseViews(obj.views, models);

    this.resolveModelAliases(unresolvedModelAliases, models, views);

    this.parseModelBindings(obj.modelBindings, models, views);
    this.parseEventBindings(obj.eventBindings, models, views);
    this.parseViewMutators(obj.viewMutators, views);

    return {header, models, views};
  }

  parseModelBindings(obj, models, views){
    obj.forEach(({view:{id: viewId}, model:{id: modelId, path: modelPath}, middlewere: middlewereDef})=>{
      const model = models.findById(modelId);
      const view = views.findById(viewId);

      const middlewere = middlewereDef && this.reducePath(Functions, middlewereDef.path);
      const modelBinding = new ModelBinding();
      modelBinding.properties = {model, middlewere, key: modelPath};

      view.modelBinding = modelBinding;
    });
  }

  parseEventBindings(obj, models, views){
    obj.forEach(({view:{id: viewId}, model:{id: modelId}, signal, signalHandler: signalHandlerDef})=>{
      const model = models.findById(modelId);
      const view = views.findById(viewId);

      const signalHandler = signalHandlerDef && this.reducePath(Functions, signalHandlerDef.path);
      const eventBinding = new EventBinding(model, signal, signalHandler);

      view.eventBinding = eventBinding;
    });
  }

  parseViewMutators(obj, views){
    obj.forEach(({view:{id:viewId}, mutator:{path}})=>{
      const viewMutator = this.reducePath(Functions, path);
      const view = views.findById(viewId);

      view.viewMutator = viewMutator;
    });
  }

  parseHeader(obj){
    return {idCounter: obj.idCounter};
  }

  resolveModelAliases(unresolvedAliases, models, views){
    unresolvedAliases.forEach(({model, alias:{key, value:{type, id}}})=>{
      switch(type) {
        case 'model':
          model.addValueProperty(key, models.findById(id));
          break;

        case 'view':
          model.addValueProperty(key, views.findById(id));
          break;
      }
    });
  }

  parseModels(obj) {
    const modelsSet = {};
    const unresolvedModelAliases = [];

    obj.forEach(({id, name: tag, properties, aliases=[]} )=>{
      const model = new Model(properties);
      modelsSet[id] = {id, tag, model};
      unresolvedModelAliases.push(...aliases.map(alias=>({model, alias})));
    });

    const models = new ModelManager(Object.values(modelsSet));

    return {models, unresolvedModelAliases};
  }

  parseViews(obj) {
    const views = {};
    const unattachedViews = [];

    obj.sort((a, b)=>a.index - b.index).forEach(({path, properties={}, id,
      parentView: parentViewDef
    })=>{
      properties.name = properties.name === undefined ? 'default' : properties.name;

      const viewFactory = this.reducePath(UI, path);
      const view = viewFactory.create({properties});

      views[id] = {id, view };

      if(parentViewDef)
        unattachedViews.push({view, id: parentViewDef.id, port: parentViewDef.port});
    });

    unattachedViews.forEach(({view, id, port})=>{
      view.parentView = {view: views[id].view, port};
    });

    return new ViewManager(Object.values(views));
  }

  reducePath(obj, path){
    const leaf = path.reduce((obj, path)=>obj[path], obj);
    // TOOD: Move to registry
    leaf.__path = path;
    return leaf;
  }

}