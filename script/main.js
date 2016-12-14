Functions.application = {};

function main(){
  let module;

  const modulePersistor = new LocalStoragePersistor(defaultPersistedState);
  Functions.application.saveState = ()=>modulePersistor.save();
  Functions.application.loadState = ()=>reload();
  Functions.application.clearState = ()=>modulePersistor.clean();
  Functions.application.addView = (signal, {type, parentId, modelId, modelKey, name='default'})=>{
    const parentView = module.views.findById(parseInt(parentId));
    const view = UI.default[type].create({ parentView, properties:{name} });

    const model = module.models.findById(parseInt(modelId));
    const key = modelKey;
    const binding = new ModelBinding();
    binding.properties = {model, key};
    view.modelBinding = binding;

    module.addView(view);
  };
  Functions.application.addCheckbox = () =>{
    Functions.application.addView({
      type: 'checkbox',
      parentId: 12,
      modelId: 2,
      modelKey: 'valid'
    });
  };

  reload();

  function reload(){
    module = modulePersistor.load();

    const applicationModel = module.models.findByTag('application');
    enableTicker(applicationModel, 'frameCount');
    enableLogger(applicationModel, ['frameCount']);

    const editorModel = module.models.findByTag('editor');
    bindingEditor(editorModel, applicationModel);

    function enableTicker(model, property){
      requestAnimationFrame(function next(){
        model[property]++;
        requestAnimationFrame(next);
      });
    }

    function enableLogger(data, ignore){
      ignore.unshift('log');
      data.listen('*', (key, value, state)=> ignore.indexOf(key) === -1 &&
      (state.log = [...state.log, `<b>${key}</b> => ${value}`]));
    }
  }
}

main();

