Functions.application = {};

function main(){
  const modulePersistor = new LocalStoragePersistor(defaultPersistedState);
  Functions.application.saveState = ()=>modulePersistor.save();
  Functions.application.loadState = ()=>modulePersistor.load();
  Functions.application.clearState = ()=>modulePersistor.clean();

  const module = modulePersistor.load();

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

main();

