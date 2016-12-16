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

  parseModelBindings(obj, models, views) {
    obj.forEach(({view:{id: viewId}, model:{id: modelId, path: modelPath}, middlewere: middlewereDef={}}) => {
      const model = models.findById(modelId);
      const view = views.findById(viewId);

      let middlewere;
      if(middlewereDef.path){
        middlewere = {
          execute: this.reducePath(Functions, middlewereDef.path),
          properties: middlewereDef.properties
        }
      }

      const modelBinding = new ModelBinding();
      modelBinding.properties = {model, middlewere, key: modelPath};

      assert(view, `No view found when parsing model bindings`);
      model || console.warn(`Model "${modelId}" not connected using view/model binding`, view, modelPath);

      view.modelBinding = modelBinding;
    });
  }

  parseEventBindings(obj, models, views) {
    obj.forEach(({view:{id: viewId}, model:{id: modelId}, signalHandler: signalHandlerDef, }) => {
      const model = models.findById(modelId);
      const view = views.findById(viewId);

      let signalHandler;
      if(signalHandlerDef){
        signalHandler = {
          execute: this.reducePath(Functions, signalHandlerDef.path),
          properties: signalHandlerDef.properties
        }
      }

      const eventBinding = new EventBinding(model, signalHandler);

      assert(view, `No view found when parsing event bindings`);
      signalHandler || console.warn(`Signal handler not connected to view`, view, signalHandlerDef);
      model || console.warn(`Model "${modelId}" not connected to view`, view);

      view.eventBinding = eventBinding;
    });
  }

  parseViewMutators(obj, views) {
    obj.forEach(({view:{id:viewId}, mutator:{path, properties={}}}) => {
      const viewMutator = this.reducePath(Functions, path);
      const view = views.findById(viewId);

      assert(view, `No view found when parsing view mutators`);

      view.viewMutator = {execute: viewMutator, properties};
    });
  }

  parseHeader(obj) {
    return {idCounter: obj.idCounter};
  }

  resolveModelAliases(unresolvedAliases, models, views) {
    unresolvedAliases.forEach(({model, alias:{key, value:{type, id}}}) => {
      switch (type) {
        case 'model':
          const childModel = models.findById(id);
          assert(childModel, `No model found when resolving aliases [${id}]`);
          model.addValueProperty(key, childModel);
          break;

        case 'view':
          const view = views.findById(id);
          assert(view, `No view found when resolving aliases [${id}]`);
          model.addValueProperty(key, view);
          break;

        default:
          console.warn(`No alias resolver available for "${type}". key = "${key}"`);
          break;
      }
    });
  }

  parseModels(obj) {
    const modelsSet = {};
    const unresolvedModelAliases = [];

    obj.forEach(({id, name: tag, properties, aliases = [], middleware = []}) => {
      const model = new Model(properties);

      middleware.forEach(({key, middleware:{path, properties}}) => {
        const method = {execute: this.reducePath(Functions, path), properties};
        model.addMiddleware(key, method);
      });

      modelsSet[id] = {id, tag, model};
      unresolvedModelAliases.push(...aliases.map(alias => ({model, alias})));
    });

    const models = new ModelManager(Object.values(modelsSet));

    return {models, unresolvedModelAliases};
  }

  parseViews(obj) {
    const views = {};
    const unattachedViews = [];

    obj.sort((a, b) => a.index - b.index).forEach(({
      path, properties = {}, id,
      parentView: parentViewDef
    }) => {
      properties.name = properties.name === undefined ? 'default' : properties.name;

      const viewFactory = this.reducePath(UI, path);
      const view = viewFactory.create({properties});

      views[id] = {id, view};

      if (parentViewDef)
        unattachedViews.push({view, id: parentViewDef.id, port: parentViewDef.port});
    });

    unattachedViews.forEach(({view, id, port}) => {
      assert(views[id].view, `No view found when attaching view to parent ${id}`, view, port);
      view.parentView = {view: views[id].view, port};
    });

    return new ViewManager(Object.values(views));
  }

  reducePath(obj, path) {
    const leaf = path.reduce((obj, path) => obj[path], obj);

    console.assert(leaf, `Unable to expand path to a value for`, path, obj);

    return leaf;
  }

}