const applicationF = new Registry('application', Functions);

function main(){
  let module;

  const modulePersistor = new LocalStoragePersistor(defaultPersistedState);

  applicationF.register('saveState', ()=>modulePersistor.save());
  applicationF.register('loadState', ()=>reload());
  applicationF.register('clearState', ()=>modulePersistor.clean());
  applicationF.register('addView', (signal, {type, parentId, modelId, modelKey, name='default'})=>{
    const parentView = module.views.findById(parseInt(parentId));
    const view = UI.default[type].create({ parentView, properties:{name} });

    if(type !== 'group') {
      const model = module.models.findById(parseInt(modelId));
      const key = modelKey;
      const binding = new ModelBinding();
      binding.properties = {model, key};
      view.modelBinding = binding;
    }

    module.addView(view);
  });
  applicationF.register('removeView', (signal, model)=>{
    const target = model.target;
    if(target) {
      const view = module.views.getMeta(target);
      target.element.remove();
      module.views.remove(view);
      model.target = null;
    }
  });
  reload();

  function reload(){
    module = modulePersistor.load();

    const applicationModel = module.models.findByTag('application');
    // enableTicker(applicationModel, 'frameCount');
    enableLogger(applicationModel, ['frameCount']);

    bindingEditor(module);

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

