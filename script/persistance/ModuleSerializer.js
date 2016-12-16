class ModuleSerializer {

  serialize(module, modules) {
    const header = this.serializeHeader(module.header);
    const views = this.serializeViews(module.views);
    const models = this.serializeModels(module.models, module, modules);

    const viewMutators = this.serializeViewMutators(module.views);
    const modelBindings = this.serializeModelBindings(module.views);
    const eventBindings = this.serializeEventBindings(module.views);

    return {header, models, views, viewMutators, modelBindings, eventBindings};
  }

  serializeViewMutators(views) {
    return views.getList()
      .filter(view => !!view.viewMutator)
      .map(view => {
        const {id} = view.meta;
        const mutator = view.viewMutator;
        const properties = mutator.properties;
        const path = mutator.execute.__path;

        return {view: {id}, mutator: {path, properties}};
      });
  }

  serializeModelBindings(views) {
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
          middleware = {
            path: middlewareInstance.execute.__path,
            properties: middlewareInstance.properties
          }
        }

        return {view: {id: viewId}, model: {id: modelId, path}, middleware};
      });
  }

  serializeEventBindings(views) {
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
  }

  serializeHeader(header) {
    return header;
  }

  serializeModels(models, thisModule, modules) {
    return models.getList()
      .map((model) => {
        const ignoredProperties = ['ignoreEqualSet', 'middleware'];
        const {id, tag: name} = model.meta;
        const aliases = [];
        const middleware = Object.entries(model.middleware).reduce((middleware, [key, values]) => {
          middleware.push(...values.map(value => ({key, middleware: {path: value.execute.__path, properties: value.properties}})));
          return middleware;
        }, []);
        const properties = Object.entries(model).reduce((properties, [key, value]) => {
          if (ignoredProperties.indexOf(key) === -1) {
            if (value instanceof Model) {
              aliases.push({key, value: {type: 'model', id: value.meta.id}});
            } else if (value instanceof ViewBinding) {
              const meta = value.meta;
              const module = modules.findByView(value);
              const moduleId = thisModule !== module
                ? module.header.id
                : null;

              aliases.push({key, value: {type: 'view', id: meta.id, moduleId}});
            } else if (value && (typeof value === 'object') && value.constructor === Object) {
              console.error(`Value not serializable`, value);
            } else {
              properties[key] = value;
            }
          }
          return properties;
        }, {});
        return {id, name, properties, aliases, middleware};
      });
  }

  serializeViews(views) {
    return views.data.map(({id, view}) => {
      const properties = view.templateProperties;
      const path = view.__path;
      const element = view.element;
      const index = [...element.parentNode.children].indexOf(element);

      let parentView;
      let parentViewInstance = view.parentView;
      if (parentViewInstance) {
        const {id} = parentViewInstance.meta;
        const port = parentViewInstance.getPortIndex(view.parentPort);

        assert(port >= 0, `Unable to find element port index, please put the following element in a dom node with a [data-port] attribute`, view.element);

        parentView = {id, port};
      }

      return {id, index, path, parentView, properties};
    });
  }
}