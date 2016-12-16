const applicationF = new Registry('application', Functions);

let exampleState;
let editorState;
function main() {
  const modules = new ModuleCollection();
  const bindingEditor = new BindingEditor();
  bindingEditor.attach();

  const modulePersistor = new LocalStoragePersistor();

  applicationF.register('saveState', () => {
    modulePersistor.save('example', exampleState, modules);
    modulePersistor.save('editor', editorState, modules);
  });
  applicationF.register('loadState', () => reload());
  applicationF.register('clearState', () => {
    modulePersistor.clean('example');
    modulePersistor.clean('editor');
  });
  applicationF.register('moveTarget', ({target:view, moveTarget:parent})=>{
    const viewModule = modules.findByView(view);
    const parentModule = modules.findByView(parent);

    if(parent.ports.length === 0){
      console.log(`Move target must have ports`);
      return;
    }

    if(viewModule !== parentModule){
      console.log('Moving views between modules will reset it"s model binding');

      view.eventBinding && view.eventBinding.dispose();
      view.modelBinding && view.modelBinding.dispose();

      view.eventBinding = null;
      view.modelBinding = null;

      viewModule.detachView(view);
      parentModule.attachView(view);
    }

    view.parentView = {view: parent, port: 0};
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

    exampleState.registerNewView(view);
  });
  applicationF.register('removeView', (model) => {
    const target = model.target;
    if (target) {
      const module = modules.findByView(target);

      const childViews = target.remove();
      childViews.forEach(child=>module.views.remove(child));

      module.detachView(target);

      model.target = null;
    }
  });
  reload();

  function reload() {
    const moduleList = modules.modules = [];

    exampleState && exampleState.unload();
    exampleState = modulePersistor.load('example', moduleList, defaultExamplePersistedState);
    moduleList.push(exampleState);

    editorState && editorState.unload();
    editorState = modulePersistor.load('editor', moduleList, defaultEditorState);
    moduleList.push(editorState);

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



main();

