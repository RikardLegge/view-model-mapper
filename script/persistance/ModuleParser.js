class ModuleParser {

  parse(obj, modules) {
    const header = this.parseHeader(obj.header);

    const {models, unresolvedModelAliases} = this.parseModels(obj.models);
    const {views} = this.parseViews(obj.views, models);
    const {middlewares} = this.parseMiddlewares(obj.middleware);

    this.resolveModelAliases(unresolvedModelAliases, models, views, modules);

    const {unresolvedModelBindingMiddleware} = this.parseModelBindings(obj.modelBindings, models, views);

    this.parseEventBindings(obj.eventBindings, models, views);
    this.parseViewMutators(obj.viewMutators, views);

    this.resolveModelBindingMiddleware(unresolvedModelBindingMiddleware, middlewares);

    return {header, models, views, middleware: middlewares};
  }

  parseMiddlewares(obj){
    const middlewareSet = {};

    obj.forEach(({id, path, properties})=>{
      const middleware = new MiddlewareDefinition();
      middleware.execute = this.reducePath(Functions, path);
      middleware.properties = properties;
      const meta = {id, middleware};

      middlewareSet[id] = meta;
      middleware.meta = meta;
    });

    const middlewares = new MiddlewareManager(Object.values(middlewareSet));
    return {middlewares};
  }

  resolveModelBindingMiddleware(unresolvedModelBindingMiddleware, middlewares){
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
      const method = middlewares.findById(id);

      assert(method, `No middleware method found for id`, id);

      return {method: method, properties: properties};
    }
  }

  parseModelBindings(obj, models, views) {
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

    return {unresolvedModelBindingMiddleware};
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

  parseHeader(header) {
    return header;
  }

  resolveModelAliases(unresolvedAliases, models, views, modules) {
    unresolvedAliases.forEach(({model, alias:{key, value:{type, id, moduleId}}}) => {
      switch (type) {
        case 'model':
          const childModel = models.findById(id);
          assert(childModel, `No model found when resolving aliases [${id}]`);
          model.addValueProperty(key, childModel);
          break;

        case 'view':
          let view;
          if(moduleId) {
            const module = modules.find(module=>module.header.id === moduleId);
            assert(module, `No module found ${moduleId}`);
            view = module.views.findById(id);
          } else {
            view = views.findById(id);
          }

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
      const model = new ModelDefinition(properties);

      middleware.forEach(({key, middleware:{path, properties}}) => {
        const method = {execute: this.reducePath(Functions, path), properties};
        model.addMiddleware(key, method);
      });

      const meta = {id, tag, model};
      model.meta = meta;

      modelsSet[id] = meta;
      unresolvedModelAliases.push(...aliases.map(alias => ({model, alias})));
    });

    const models = new ModelManager(Object.values(modelsSet));

    return {models, unresolvedModelAliases};
  }

  parseViews(obj) {
    const viewsSet = {};
    const unattachedViews = [];

    obj.sort((a, b) => a.index - b.index).forEach(({
      path, properties = {}, id,
      parentView: parentViewDef
    }) => {
      properties.name = properties.name === undefined ? 'default' : properties.name;

      const viewFactory = this.reducePath(UI, path);
      const view = viewFactory.create({properties});

      const meta = {id, view};
      view.meta = meta;

      viewsSet[id] = meta;

      if (parentViewDef)
        unattachedViews.push({view, id: parentViewDef.id, port: parentViewDef.port});
    });

    unattachedViews.forEach(({view, id, port}) => {
      assert(viewsSet[id].view, `No view found when attaching view to parent ${id}`, view, port);
      view.parentView = {view: viewsSet[id].view, port};
    });

    const views = new ViewManager(Object.values(viewsSet));
    return {views};
  }

  reducePath(obj, path) {
    const leaf = path.reduce((obj, path) => obj && obj[path], obj);

    console.assert(leaf, `Unable to expand path to a value for`, path, obj);

    return leaf;
  }

}