const presistedState = {
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
    }
  ],
  views: [
    {id: 11, type: ['default', 'root']},

    {id: 12, type: ['default','checkbox'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:11, port: 0}},
    {id: 13, type: ['default', 'checkbox'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:11, port: 0}, middlewere: {type:['invert']}},
    {id: 14, type: ['default', 'label'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:11, port: 0}},
    {id: 15, type: ['default', 'label'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:11, port: 0}, middlewere: {type:['invert']}},
    {id: 16, type: ['default', 'text'], modelBinding: {id:2, path: 'pressed'}, parentView: {id:11, port: 0}},

    {id: 17, type: ['default', 'label'], modelBinding: {id:2, path: 'exampleText'}, parentView: {id:11, port: 0}},

    {id: 18, type: ['default', 'label'], parentView: {id:11, port: 0}, properties: {name: 'callstack__container'}},
    {id: 19, type: ['default', 'label'], modelBinding: {id:1, path: 'log'}, parentView: {id:18, port: 0}, middlewere: {type:['wrapLines']}, properties: {name: 'callstack'}},

  ]
};

parsePersistedState(presistedState);

function parsePersistedState(state){
  const models = {};
  const unresolvedModelAliases = [];

  state.models.forEach(({id: key, properties, aliases=[]} )=>{
    const model = new Model(properties);
    models[key] = model;
    unresolvedModelAliases.push(...aliases.map(alias=>({model, alias})));
  });

  unresolvedModelAliases.forEach(({model, alias:{key, value:{type, id}}})=>{
    switch(type) {
      case 'model':
        model.addValueProperty(key, models[id]);
        break;
    }
  });
  unresolvedModelAliases.length = 0;

  const views = {};
  const unattachedViews = [];

  state.views.forEach(({type, properties,
    id: key,
    modelBinding: modelBindingDef,
    eventBinding: eventBindingDef,
    parentView: parentViewDef,
    middlewere: middlewereDef
  })=>{
    const middlewere = middlewereDef && reduce(Middlewere, middlewereDef.type);
    const modelBinding = modelBindingDef && new ModelBinding(models[modelBindingDef.id], modelBindingDef.path, middlewere);
    const eventBinding = eventBindingDef && new EventBinding(models[eventBindingDef.id], eventBindingDef.signal);

    const viewFactory = reduce(UI, type);
    const view = viewFactory.create({modelBinding, eventBinding, properties});

    views[key] = view;

    if(parentViewDef)
      unattachedViews.push({view, parentViewDef});
  });

  unattachedViews.forEach(({view, parentViewDef})=>{
    view.setParentView(views[parentViewDef.id])
  });
  unattachedViews.length = 0;

  function reduce(obj, path){
    return path.reduce((obj, path)=>obj[path], obj);
  }

  onLoad({model: models[1]});
}

function onLoad({model}){
  enableLogger(model, ['frameCount']);
}

function enableLogger(data, ignore){
  ignore.unshift('log');
  data.listen('*', (key, value, state)=> ignore.indexOf(key) === -1 &&
  (state.log = [...state.log, `<b>${key}</b> => ${value}`]));
}

// Create the UI editor

const viewRoot = UI.default.root.create();
function bindingEditor() {

  const editorModel = new Model({
    modelText: '',
    viewText: '',
    eventText: '',
    target: null,
    suggestions: []
  });

  editorModel.listen('target', () => {
    const target = editorModel.target;
    if(target){
      const modelBinding = target.getModelBinding();
      const eventBinding = target.getEventBinding();

      editorModel.eventText = eventBinding ? eventBinding.getPath().join('.') : '[EventBinding UNAVAILABLE]';
      editorModel.modelText = modelBinding ? modelBinding.getPath().join('.') : '[ModelBinding UNAVAILABLE]';
    } else {
      editorModel.eventText = '';
      editorModel.modelText = '';
    }
  });

  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);

  function updateEventBinding(){
    if (!editorModel.target || !editorModel.target.getEventBinding()) {
      eventInput.disable();
      return;
    }
    eventInput.enable();

    const signal = editorModel.eventText;
    editorModel.target.getEventBinding().setModel({signal});
  }

  function updateModelBinding(){
    if (!editorModel.target || !editorModel.target.getModelBinding()) {
      editorModel.suggestions = [];
      modelInput.disable();
      return;
    }
    modelInput.enable();

    const targetPath = editorModel.modelText;
    const paths = [];//ReflectModel.getPaths(applicationState);

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

      editorModel.target.getModelBinding().setModel(path.pop());
      console.log(`Model set to ${fullPath}`);
    }
  }

  const modelInput = UI.default.text.create({ modelBinding: new ModelBinding(editorModel, 'modelText'), properties: { name: 'modelEditor' }, parentView: viewRoot });
  const eventInput = UI.default.text.create({ modelBinding: new ModelBinding(editorModel, 'eventText'), properties: { name: 'eventEditor' }, parentView: viewRoot });
  UI.default.label.create({ modelBinding: new ModelBinding(editorModel, 'suggestions', a=>a.join('<br>')), properties: { name: 'modelEditor' }, parentView: viewRoot });

  document.body.addEventListener('click', (event) => {
    let element = findViewInPath(event.path);
    setTarget(element);
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

    if (element === modelInput.getElement() || element === eventInput.getElement()) {
      return;
    }

    if (editorModel.target) {
      editorModel.target.getElement().style = '';
    }

    if (element) {
      editorModel.target = element.boundView;
      editorModel.target.getElement().style = 'background:rgba(200,200,100, .4)';
    } else {
      editorModel.target = null;
    }
  }
}

bindingEditor();
