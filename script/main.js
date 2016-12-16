const applicationF = new Registry('application', Functions);

let exampleState;
let editorState;
function main() {
  const modules = new ModuleCollection();
  const bindingEditor = new BindingEditor();
  bindingEditor.attach();

  const modulePersistor = new LocalStoragePersistor();

  applicationF.register('saveState', () => {
    modulePersistor.save('example', exampleState);
    modulePersistor.save('editor', editorState);
  });
  applicationF.register('loadState', () => reload());
  applicationF.register('clearState', () => {
    modulePersistor.clean('example');
    modulePersistor.clean('editor');
  });
  applicationF.register('addView', ({type, parentId, modelId, modelKey, name = 'default'}) => {
    const parentView = exampleState.views.findById(parseInt(parentId));
    const model = exampleState.models.findById(parseInt(modelId));

    if(!parentView)
      return console.error(`A valid parent view must be provided when adding views`);

    if(!model)
      return console.error(`A valid model must be provided when adding views`);

    const view = UI.default[type].create({parentView, properties: {name}});

    const key = modelKey;
    const binding = new ModelBinding();
    binding.properties = {model, key};
    view.modelBinding = binding;

    exampleState.addView(view);
  });
  applicationF.register('removeView', (model) => {
    const target = model.target;
    if (target) {
      const module = modules.findByView(target);
      const viewMeta = module.views.getMeta(target);

      const childViews = target.remove();
      childViews.forEach(child=>module.views.remove(module.views.getMeta(child)));

      module.views.remove(viewMeta);

      model.target = null;
    }
  });
  reload();

  function reload() {
    editorState && editorState.unload();
    editorState = modulePersistor.load('editor', defaultEditorState);

    exampleState && exampleState.unload();
    exampleState = modulePersistor.load('example', defaultExamplePersistedState);

    modules.modules = [exampleState, editorState];

    const applicationModel = exampleState.models.findByTag('application');
    // enableTicker(applicationModel, 'frameCount');
    enableLogger(applicationModel, ['frameCount']);

    const editorModel = editorState.models.findByTag('editor');
    bindingEditor.setModule(editorModel, modules);

    function enableTicker(model, property) {
      requestAnimationFrame(function next() {
        model[property]++;
        requestAnimationFrame(next);
      });
    }

    function enableLogger(data, ignore) {
      ignore.unshift('log');
      data.listen('*', (key, value, state) => ignore.indexOf(key) === -1 &&
      (state.log = [...state.log, `<b>${key}</b> => ${value}`]));
    }
  }
}

class ModuleCollection {
  constructor(modules=[]){
    this.modules = modules;
  }

  findByView(view){
    return this.modules.find(module=>module.views.getList().indexOf(view) !== -1);
  }

  findByModel(model){
    return this.modules.find(module=>module.models.getList().indexOf(model) !== -1);
  }

  getKeyedModels(module){
    return module
      ? module.models.models.reduce((models, model) => (models[model.tag] = model.model, models), {})
      : {};
  }
}

main();

