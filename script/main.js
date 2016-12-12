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
    {id: 11, path: ['default', 'root']},
    {id: 12, path: ['default', 'group'], parentView: {id:11, port: 0}},
    {id: 13, path: ['default', 'group'], parentView: {id:11, port: 0}, properties:{name:'log'}},

    {id: 20, path: ['default','checkbox'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:12, port: 0}},
    {id: 21, path: ['default', 'checkbox'], modelBinding: {id:2, path: 'pressed', middlewere: {path:['helloworld', 'invert']}}, parentView: {id:12, port: 0}},
    {id: 22, path: ['default', 'label'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:12, port: 0}},
    {id: 23, path: ['default', 'label'], modelBinding: {id:2, path: 'pressed', middlewere: {path:['helloworld', 'invert']}}, parentView: {id:12, port: 0}},
    {id: 24, path: ['default', 'text'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:12, port: 0}},

    {id: 25, path: ['default', 'label'], modelBinding: {id:2, path: 'exampleText'}, parentView: {id:12, port: 0}},

    {id: 26, path: ['default', 'label'], modelBinding: {id:1, path: 'log', middlewere: {path:['helloworld', 'wrapLines']}}, parentView: {id:13, port: 0}, properties: {name: 'callstack'}},

    {id: 32, path: ['default', 'button'], eventBinding: {id: 2, signal: 'signal1', signalHandler: {path:['helloworld', 'saveView']}}, parentView: {id:12, port: 0} },
    {id: 33, path: ['default', 'label'], modelBinding: {id:4, path: 'save'}, parentView: {id:32, port: 0}},

    {id: 34, path: ['default', 'button'], eventBinding: {id: 2, signal: 'signal1', signalHandler: {path:['helloworld', 'loadView']}}, parentView: {id:12, port: 0} },
    {id: 35, path: ['default', 'label'], modelBinding: {id:4, path: 'load'}, parentView: {id:34, port: 0}},

    {id: 36, path: ['default', 'button'], eventBinding: {id: 2, signal: 'signal1', signalHandler: {path:['helloworld', 'clearView']}}, parentView: {id:12, port: 0} },
    {id: 37, path: ['default', 'label'], modelBinding: {id:4, path: 'clear'}, parentView: {id:36, port: 0}},

    {id: 28, path: ['default', 'group'], parentView: {id:11, port: 0}, properties: { name: 'bindingEditor' }},

    {id: 29, path: ['default', 'label'], modelBinding: {id:3, path: 'suggestions', middlewere: {path:['helloworld', 'wrapLines']}}, parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 30, path: ['default', 'text'], modelBinding: {id:3, path: 'modelText', middlewere:{path:['helloworld','rewriteNullModelText']}}, parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 31, path: ['default', 'text'], modelBinding: {id:3, path: 'eventText', middlewere:{path:['helloworld','rewriteNullEventText']}}, parentView: {id:28, port: 0}, properties: {name: 'bindingEditor'}},
  ],

  viewMutators: [
    {view: {id: 30}, path:['helloworld','disableIfModelTextNull']},
    {view: {id: 31}, path:['helloworld','disableIfEventTextNull']},
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
    const {header, models, views, viewMutators} = this.stateParser.parse(obj);
    this.header = header;
    this.models = models;
    this.views = views;
    this.viewMutators = viewMutators;
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

class ViewMutatorManager extends DataManager{
  constructor(viewMutators){
    super(viewMutators, 'viewMutator');
    this.viewMutators = viewMutators;
  }
}

class StateParser {

  parse(obj) {
    const header = this.parseHeader(obj.header);
    const {models, unresolvedModelAliases} = this.parseModels(obj.models);
    const views = this.parseViews(obj.views, models);
    const viewMutators = this.parseViewMutators(obj.viewMutators, views);

    this.resolveModelAliases(unresolvedModelAliases, models, views);

    return {header, models, views, viewMutators};
  }

  parseViewMutators(obj, views){
    const viewMutators =  obj.map(({view:{id:viewId}, path})=>{
      const viewMutator = this.reducePath(Functions, path);
      const view = views.findById(viewId);

      view.setViewMutator(viewMutator);

      return {view, path, viewMutator};
    });

    return new ViewMutatorManager(viewMutators);
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

  parseViews(obj, models) {
    const views = {};
    const unattachedViews = [];

    obj.forEach(({path, properties={}, id,
      modelBinding: modelBindingDef,
      eventBinding: eventBindingDef,
      parentView: parentViewDef
    })=>{
      properties.name = properties.name === undefined ? 'default' : properties.name;

      let modelBinding;
      let middlewereDef;
      if(modelBindingDef){
        middlewereDef = modelBindingDef.middlewere;
        const middlewere = middlewereDef && this.reducePath(Functions, middlewereDef.path);
        const model = models.findById(modelBindingDef.id);
        modelBinding = model && modelBindingDef && new ModelBinding(model, modelBindingDef.path, middlewere);
      }

      let eventBinding;
      let signalHandlerDef;
      if(eventBindingDef) {
        signalHandlerDef = eventBindingDef.signalHandler;
        const signalHandler = signalHandlerDef && this.reducePath(Functions, signalHandlerDef.path);
        const model = models.findById(eventBindingDef.id);
        eventBinding = eventBindingDef && new EventBinding(model, eventBindingDef.signal, signalHandler);
      }

      const viewFactory = this.reducePath(UI, path);
      const view = viewFactory.create({modelBinding, eventBinding, properties});

      views[id] = {id, view, properties,
        registryPath: path,
        eventBindingDef: {signalHandlerDef: signalHandlerDef},
        modelBindingDef: {middlewereDef: middlewereDef}
      };

      if(parentViewDef)
        unattachedViews.push({view, parentViewDef});
    });

    unattachedViews.forEach(({view, parentViewDef})=>{
      view.setParentView(views[parentViewDef.id].view, parentViewDef.port)
    });

    return new ViewManager(Object.values(views));
  }

  reducePath(obj, path){
    return path.reduce((obj, path)=>obj[path], obj);
  }

}

class StateSerializer {

  serialize(obj){
    const header = this.serializeHeader(obj.header);
    const views = this.serializeViews(obj.views, obj.models);
    const models = this.serializeModels(obj.models, obj.views);
    const viewMutators = this.serializeViewMutators(obj.viewMutators, obj.views);

    return {header, models, views, viewMutators};
  }

  serializeViewMutators(obj, views){
    return obj.viewMutators.map(({view, viewMutator, path})=>{
      const viewId = views.getMeta(view).id;
      view.setViewMutator(viewMutator);

      return {view:{id: viewId}, path, viewMutator};
    });
  }

  serializeHeader(obj){
    return {idCounter: obj.idCounter};
  }

  serializeModels(obj, views) {
    return obj.models.map(({id, tag: name, model})=>{
      const aliases = [];
      const properties = Object.entries(model).reduce((properties, [key, value])=>{
        if(value instanceof Model) {
          aliases.push({
            key, value: {type: 'model', id: obj.getMeta(value).id}
          });
        } else if(value instanceof ViewBinding) {
            aliases.push({
              key, value: {type: 'view', id: views.getMeta(value).id}
            });
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

  serializeViews(obj, models) {
    return obj.views.map(({id, registryPath, view, properties, eventBindingDef, modelBindingDef})=>{

      let modelBinding;
      const modelBindingInstance = view.getModelBinding();
      if(modelBindingInstance) {
        const model = modelBindingInstance.getModel();
        const id = models.getMeta(model).id;
        const path = modelBindingInstance.getKey();

        modelBinding = {id, path, middlewere: modelBindingDef.middlewereDef};
      }

      let eventBinding;
      const eventBindingInstance = view.getEventBinding();
      if(eventBindingInstance) {
        const model = eventBindingInstance.getModel();
        const id = models.getMeta(model).id;
        const signal = eventBindingInstance.getKey();

        eventBinding = {id, signal, signalHandler: eventBindingDef.signalHandlerDef};
      }

      let parentView;
      let parentViewInstance = view.getParentView();
      if(parentViewInstance){
        const {id} = obj.getMeta(parentViewInstance);
        const port = parentViewInstance.getPortIndex(view.getParentPort());
        parentView = {id, port};
      }

      return {id, path: registryPath, modelBinding, eventBinding, parentView, properties};
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
      editorModel.eventText = '';
      editorModel.modelText = '';
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
