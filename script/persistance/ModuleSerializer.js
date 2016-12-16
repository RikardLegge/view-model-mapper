class ModuleSerializer {

  serialize(obj) {
    const header = this.serializeHeader(obj.header);
    const views = this.serializeViews(obj.views, obj.models);
    const models = this.serializeModels(obj.models, obj.views);

    const viewMutators = this.serializeViewMutators(obj.views);
    const modelBindings = this.serializeModelBindings(obj.views, obj.models);
    const eventBindings = this.serializeEventBindings(obj.views, obj.models);

    return {header, models, views, viewMutators, modelBindings, eventBindings};
  }

  serializeViewMutators(views) {
    return views.getList()
      .filter(view => !!view.viewMutator)
      .map(view => {
        const {id} = views.getMeta(view);
        const mutator = view.viewMutator;
        const properties = mutator.properties;
        const path = mutator.execute.__path;

        return {view: {id}, mutator: {path, properties}};
      });
  }

  serializeModelBindings(views, models) {
    return views.getList()
      .filter(view => !!view.modelBinding)
      .map(view => {
        const modelBinding = view.modelBinding;
        const model = modelBinding.model;
        const middlewareInstance = modelBinding.middleware;

        const {id: viewId} = views.getMeta(view);
        const {id: modelId} = models.getMeta(model);
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

  serializeEventBindings(views, models) {
    return views.getList()
      .filter(view => !!view.eventBinding)
      .map(view => {
        const eventBinding = view.eventBinding;
        const model = eventBinding.model;
        const signalHandlerInstance = eventBinding.signalHandler;

        const {id: viewId} = views.getMeta(view);
        const {id: modelId} = models.getMeta(model);

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
    return {idCounter: header.idCounter};
  }

  serializeModels(models, views) {
    return models.getList()
      .map((model) => {
        const ignoredProperties = ['ignoreEqualSet', 'middleware'];
        const {id, tag: name} = models.getMeta(model);
        const aliases = [];
        const middleware = Object.entries(model.middleware).reduce((middleware, [key, values]) => {
          middleware.push(...values.map(value => ({key, middleware: {path: value.execute.__path, properties: value.properties}})));
          return middleware;
        }, []);
        const properties = Object.entries(model).reduce((properties, [key, value]) => {
          if (ignoredProperties.indexOf(key) === -1) {
            if (value instanceof Model) {
              aliases.push({key, value: {type: 'model', id: models.getMeta(value).id}});
            } else if (value instanceof ViewBinding) {
              const meta = views.getMeta(value);
              if(meta) {
                aliases.push({key, value: {type: 'view', id: meta.id}});
              } else {
                properties[key] = null;
                console.warn(`Unable to find view. Selecting between modules is currently not supported`, value, views)
              }
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
    return views.views.map(({id, view}) => {
      const properties = view.templateProperties;
      const path = view.__path;
      const element = view.element;
      const index = [...element.parentNode.children].indexOf(element);

      let parentView;
      let parentViewInstance = view.parentView;
      if (parentViewInstance) {
        const {id} = views.getMeta(parentViewInstance);
        const port = parentViewInstance.getPortIndex(view.parentPort);

        assert(port >= 0, `Unable to find element port index, please put the following element in a dom node with a [data-port] attribute`, view.element);

        parentView = {id, port};
      }

      return {id, index, path, parentView, properties};
    });
  }
}