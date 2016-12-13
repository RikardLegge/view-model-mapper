const defaultPresistedState = {
  header: {
    idCounter: 28
  },
  models: [
    {
      id: 1,
      name: 'application',
      properties: {
        frameCount: 0,
        counter: 1,
        log: []
      },
      aliases: [
        {key: 'button', value: {type: 'model', id: 2}}
      ]
    },
    {
      id: 2,
      properties: {
        pressed: false,
        valid: true,
        invalid: false,
        exampleText: 'Press me! Then change "button.exampleText" to "frameCount"'
      }
    },
    {
      id: 3,
      name: 'editor',
      properties: {
        modelText: '',
        viewText: '',
        eventText: '',
        target: null,
        suggestions: []
      }
    },
    {
      id: 4,
      name: 'text',
      properties: {
        save: 'Save',
        load: 'Load',
        clear: 'Clear'
      }
    }
  ],
  views: [
    {id: 11, index: 0, path: ['default', 'root']},

    {id: 13, index: 1, path: ['default', 'group'], parentView: {id:11, port: 0}, properties:{name:'log'}},
    {id: 26, index: 0, path: ['default', 'label'], parentView: {id:13, port: 0}, properties: {name: 'callstack'}},


    {id: 12, index: 0, path: ['default', 'group'], parentView: {id:11, port: 0}},

    {id: 20, index: 0, path: ['default','checkbox'], parentView: {id:12, port: 0}},
    {id: 21, index: 2, path: ['default', 'checkbox'], parentView: {id:12, port: 0}},
    {id: 22, index: 1, path: ['default', 'label'], parentView: {id:12, port: 0}},
    {id: 23, index: 3, path: ['default', 'label'], parentView: {id:12, port: 0}},
    {id: 24, index: 4, path: ['default', 'text'], parentView: {id:12, port: 0}},

    {id: 25, index: 5, path: ['default', 'label'], parentView: {id:12, port: 0}},

    {id: 28, index: 2, path: ['default', 'group'], parentView: {id:11, port: 0}, properties: { name: 'bindingEditor' }},

    {id: 32, index: 0, path: ['default', 'button'], parentView: {id:28, port: 0} },
    {id: 33, index: 0, path: ['default', 'label'], parentView: {id:32, port: 0}},

    {id: 34, index: 1, path: ['default', 'button'], parentView: {id:28, port: 0} },
    {id: 35, index: 0, path: ['default', 'label'], parentView: {id:34, port: 0}},

    {id: 36, index: 2, path: ['default', 'button'], parentView: {id:28, port: 0} },
    {id: 37, index: 0, path: ['default', 'label'], parentView: {id:36, port: 0}},

    {id: 29, index: 3, path: ['default', 'label'], parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 30, index: 4, path: ['default', 'text'], parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 31, index: 5, path: ['default', 'text'], parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
  ],

  viewMutators: [
    {view: {id: 30}, mutator: {path:['helloworld','disableIfModelTextNull']}},
    {view: {id: 31}, mutator: {path:['helloworld','disableIfEventTextNull']}},
  ],

  modelBindings: [
    {view: {id: 26}, model: {id: 1, path: 'log'}, middlewere: {path:['helloworld', 'wrapLines']}},
    {view: {id: 20}, model: {id: 2, path: 'pressed'}},
    {view: {id: 21}, model: {id: 2, path: 'pressed'}, middlewere: {path:['helloworld', 'invert']}},
    {view: {id: 22}, model: {id: 2, path: 'pressed'}},
    {view: {id: 23}, model: {id: 2, path: 'pressed'}, middlewere: {path:['helloworld', 'invert']}},
    {view: {id: 24}, model: {id: 2, path: 'pressed'}},
    {view: {id: 25}, model: {id: 2, path: 'exampleText'}},
    {view: {id: 33}, model: {id: 4, path: 'save'}},
    {view: {id: 35}, model: {id: 4, path: 'load'}},
    {view: {id: 37}, model: {id: 4, path: 'clear'}},
    {view: {id: 29}, model: {id: 3, path: 'suggestions'}, middlewere: {path:['helloworld', 'wrapLines']}},
    {view: {id: 30}, model: {id: 3, path: 'modelText'}, middlewere:{path:['helloworld','rewriteNullModelText']}},
    {view: {id: 31}, model: {id: 3, path: 'eventText'}, middlewere:{path:['helloworld','rewriteNullEventText']}}
  ],

  eventBindings: [
    {view: {id: 32}, model: {id: 2}, signal: 'signal1', signalHandler: {path:['helloworld', 'saveView']}},
    {view: {id: 34}, model: {id: 2}, signal: 'signal1', signalHandler: {path:['helloworld', 'loadView']}},
    {view: {id: 36}, model: {id: 2}, signal: 'signal1', signalHandler: {path:['helloworld', 'clearView']}},
  ]
};

class StatePersistor {

  constructor(){
    this.stateParser = new StateParser();
    this.stateSerializer = new StateSerializer();
    this.header = {};
    this.models = [];
    this.views = [];
  }

  importState(obj) {
    const {header, models, views} = this.stateParser.parse(obj);
    this.header = header;
    this.models = models;
    this.views = views;
  }

  exportState() {
    return this.stateSerializer.serialize(this);
  }

}

class DataManager {
  constructor(data, metaKey){
    this.data = data;
    this.metaKey = metaKey;
  }

  getList(){
    return this.data.map(it=>it[this.metaKey]);
  }

  find(op){
    const def = this.data.find(op);
    return def ? def[this.metaKey] : null;
  }

  findByTag(tag){
    return this.find(it=>it.tag === tag);
  }

  findById(id){
    return this.find(it=>it.id === id);
  }

  getMeta(target) {
    return this.data.find(data=>data[this.metaKey] === target);
  }
}

class ModelManager extends DataManager{
  constructor(models){
    super(models, 'model');
    this.models = models;
  }
}

class ViewManager extends DataManager{
  constructor(views){
    super(views, 'view');
    this.views = views;
  }
}

class StateParser {

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
      const modelBinding = new ModelBinding(model, modelPath, middlewere);

      view.setModelBinding(modelBinding);
    });
  }

  parseEventBindings(obj, models, views){
    obj.forEach(({view:{id: viewId}, model:{id: modelId}, signal, signalHandler: signalHandlerDef})=>{
      const model = models.findById(modelId);
      const view = views.findById(viewId);

      const signalHandler = signalHandlerDef && this.reducePath(Functions, signalHandlerDef.path);
      const modelBinding = new EventBinding(model, signal, signalHandler);

      view.setEventBinding(modelBinding);
    });
  }

  parseViewMutators(obj, views){
    obj.forEach(({view:{id:viewId}, mutator:{path}})=>{
      const viewMutator = this.reducePath(Functions, path);
      const view = views.findById(viewId);

      view.setViewMutator(viewMutator);
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
      view.setParentView(views[id].view, port)
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

class StateSerializer {

  serialize(obj){
    const header = this.serializeHeader(obj.header);
    const views = this.serializeViews(obj.views, obj.models);
    const models = this.serializeModels(obj.models, obj.views);

    const viewMutators = this.serializeViewMutators(obj.views);
    const modelBindings = this.serializeModelBindings(obj.views, obj.models);
    const eventBindings = this.serializeEventBindings(obj.views, obj.models);

    return {header, models, views, viewMutators, modelBindings, eventBindings};
  }

  serializeViewMutators(views){
    return views.getList()
      .filter(view=>!!view.getViewMutator())
      .map(view=>{
        const id = views.getMeta(view).id;
        const mutator = view.getViewMutator();
        const path = mutator.__path;

        return {view:{id}, mutator: {path}};
      });
  }

  serializeModelBindings(views, models){
    return views.getList()
      .filter(view=>!!view.getModelBinding())
      .map(view=>{
        const modelBinding = view.getModelBinding();
        const model = modelBinding.getModel();
        const middlewereInstance = modelBinding.getMiddlewere();

        const viewId = views.getMeta(view).id;
        const modelId = models.getMeta(model).id;
        const path = modelBinding.getKey();
        const middlewere = middlewereInstance && middlewereInstance.__path
          ? {path: middlewereInstance.__path}
          : undefined;

        return {view: {id: viewId}, model: {id: modelId, path}, middlewere};
      });
  }

  serializeEventBindings(views, models){
    return views.getList()
      .filter(view=>!!view.getEventBinding())
      .map(view=>{
        const eventBinding = view.getEventBinding();
        const model = eventBinding.getModel();
        const signalHandlerInstance = eventBinding.getSignalHandler();

        const viewId = views.getMeta(view).id;
        const modelId = models.getMeta(model).id;
        const signal = eventBinding.getKey();
        const signalHandler = signalHandlerInstance && signalHandlerInstance.__path
          ? {path: signalHandlerInstance.__path}
          : undefined;

        return {view: {id: viewId}, model: {id: modelId}, signal, signalHandler};
      });
  }

  serializeHeader(header){
    return {idCounter: header.idCounter};
  }

  serializeModels(models, views) {
    return models.getList()
      .map((model)=>{
        const {id, tag: name} = models.getMeta(model);
        const aliases = [];
        const properties = Object.entries(model).reduce((properties, [key, value])=>{
          if(value instanceof Model) {
            aliases.push({ key, value: {type: 'model', id: models.getMeta(value).id} });
          } else if(value instanceof ViewBinding) {
              aliases.push({ key, value: {type: 'view', id: views.getMeta(value).id} });
          } else if(value && (typeof value === 'object') && value.constructor === Object) {
            console.error(`Value not serializable`, value);
          } else {
            properties[key] = value;
          }
          return properties;
        }, {});
        return { id, name, properties, aliases };
      });
  }

  serializeViews(views) {
    return views.views.map(({id, view})=>{
      const properties = view.templateProperties;
      const path = view.__path;
      const element = view.getElement();
      const index = [...element.parentNode.children].indexOf(element);

      let parentView;
      let parentViewInstance = view.getParentView();
      if(parentViewInstance){
        const {id} = views.getMeta(parentViewInstance);
        const port = parentViewInstance.getPortIndex(view.getParentPort());
        parentView = {id, port};
      }

      return {id, index, path, parentView, properties};
    });
  }
}

var save;
load();

function load(){
  document.body.innerHTML = '';
  const storedState = localStorage.getItem('state');
  const presistedState = storedState
    ? JSON.parse(storedState)
    : defaultPresistedState;
  const statePersistor = new StatePersistor();
  statePersistor.importState(presistedState);



  const applicationModel = statePersistor.models.findByTag('application');
  enableLogger(applicationModel, ['frameCount']);

  requestAnimationFrame(function next(){
    applicationModel.frameCount++;
    requestAnimationFrame(next);
  });

  save = function(){
    const json = JSON.stringify(statePersistor.exportState());
    localStorage.setItem('state', json);
  };

  const editorModel = statePersistor.models.findByTag('editor');
  bindingEditor(editorModel, applicationModel);
}

function enableLogger(data, ignore){
  ignore.unshift('log');
  data.listen('*', (key, value, state)=> ignore.indexOf(key) === -1 &&
  (state.log = [...state.log, `<b>${key}</b> => ${value}`]));
}

// Create the UI editor

// const viewRoot = UI.default.root.create();
function bindingEditor(editorModel, applicationModel) {

  editorModel.listen('target', () => {
    const target = editorModel.target;
    if(target){
      editorModel.target.getElement().style = 'background:rgba(200,200,100, .4)';

      const modelBinding = target.getModelBinding();
      const eventBinding = target.getEventBinding();

      editorModel.eventText = eventBinding ? eventBinding.getPath().join('.') : null;
      editorModel.modelText = modelBinding ? modelBinding.getPath().join('.') : null;
    } else {
      editorModel.eventText = null;
      editorModel.modelText = null;
    }
  });

  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);

  function updateEventBinding(){
    if (!editorModel.target || !editorModel.target.getEventBinding()) {
      return;
    }

    const signal = editorModel.eventText;
    editorModel.target.getEventBinding().setModel({signal});
  }

  function updateModelBinding(){
    if (!editorModel.target || !editorModel.target.getModelBinding()) {
      editorModel.suggestions = [];
      return;
    }

    const targetPath = editorModel.modelText;
    const paths = ReflectModel.getPaths(applicationModel);

    editorModel.suggestions = paths
      .filter(path=>path.map(path => path.key).join('.').indexOf(targetPath) === 0)
      .map(path=>path.map(path => `<b>${path.key}</b>`).join('.') + ` => ${path[path.length-1].model[path[path.length-1].key]}`);

    const textPaths = paths.map(path=>path.map(path => path.key).join('.'));
    const index = textPaths.findIndex(path => path === targetPath);
    const path = paths[index];

    if (path) {
      const fullPath = path.map(path => path.key).join('.');

      if(fullPath === editorModel.target.getModelBinding().getPath().join('.')){
        return;
      }

      const modelDef = path.pop();
      editorModel.target.getModelBinding().setModel({modelData: modelDef.model, propertyKey: modelDef.key});
      console.log(`Model set to ${fullPath}`);
    }
  }

  document.body.addEventListener('click', (event) => {
    if(event.altKey) {
      let element = findViewInPath(event.path);
      setTarget(element);
    }
  });

  function findViewInPath(path) {
    return path.find(element => {
      const view = element.boundView;
      if(view !== undefined){
        if(view.getModelBinding() || view.getEventBinding()){
          return true;
        }
      }

      return false;
    });
  }

  function setTarget(element) {

    if (editorModel.target) {
      const targetElement = editorModel.target.getElement();
      if(element === targetElement)
        return;
      editorModel.target.getElement().style = '';
    }

    if (element) {
      editorModel.target = element.boundView;
    } else {
      editorModel.target = null;
    }
  }
}

// bindingEditor();
