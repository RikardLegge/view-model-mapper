const applicationF = new Registry('application', Functions);

let exampleState;
let editorState;
const modulePersistor = new LocalStoragePersistor();
const bindingEditor = new BindingEditor();

function main() {
  const modules = new ModuleCollection();
  bindingEditor.attach();


  applicationF.register('saveState', (model) => {
    // modulePersistor.save('example', exampleState, modules);
    model.lastSaved = Date.now();
    modulePersistor.save('editor', editorState, modules);
  });
  applicationF.register('alert', () => alert('hej'));
  applicationF.register('loadState', () => reload());
  applicationF.register('clearState', () => {
    // modulePersistor.clean('example');
    modulePersistor.clean('editor');
  });
  applicationF.register('addView', ({type, editor, modelTag, modelKey, name = 'default'}) => {
    const target = editor.target;
    const module = modules.findByView(target);

    if(!module){
      console.log(`A view must be provided`);
      return;
    }

    const parentView = target;
    const model = module.models.findByTag(modelTag);

    if(!parentView)
      return console.error(`A valid parent view must be provided when adding views`);

    const view = UI.default[type].create({parentView, properties: {name}});

    if(model) {
      const key = modelKey;
      const binding = new ModelBinding();
      binding.properties = {model};
      binding.properties = {key};
      view.modelBinding = binding;
    }

    module.registerNewView(view);
    editor.target = view;
  });
  applicationF.register('removeView', (model) => {
    const target = model.target;
    if (target) {
      const module = modules.findByView(target);

      const childViews = target.remove();
      childViews.forEach(child=>module.views.remove(child.meta));

      module.detachView(target);

      model.target = null;
    }
  });
  reload();

  function reload() {
    const moduleList = modules.modules = [];

    exampleState && exampleState.unload();
    // exampleState = modulePersistor.load('example', moduleList, defaultExamplePersistedState);
    // moduleList.push(exampleState);

    editorState && editorState.unload();
    editorState = modulePersistor.load('editor', moduleList, defaultEditorState);
    moduleList.push(editorState);

    // const applicationModel = exampleState.models.findByTag('application');
    // enableTicker(applicationModel, 'frameCount');
    // enableLogger(applicationModel, ['frameCount']);

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

