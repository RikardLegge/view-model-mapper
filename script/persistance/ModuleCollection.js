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

}