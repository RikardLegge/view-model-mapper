class Module {

  constructor() {
    this.stateParser = new ModuleParser();
    this.stateSerializer = new ModuleSerializer();
    this.header = {};
    this.models = null;
    this.views = null;
  }

  load(obj, modules) {
    const {header, models, views} = this.stateParser.parse(obj, modules);
    this.header = header;
    this.models = models;
    this.views = views;
  }

  detachView(view){
    this.views.remove(view.meta);
  }

  attachView(view){
    this.views.add(view.meta);
  }

  unload() {
    this.views.getList().forEach(view=>view.remove());

    this.header = {};
    this.models = null;
    this.views = null;
  }

  registerNewView(view) {
    const id = ++this.header.idCounter;
    const viewDescriptor = {id, view};
    view.meta = viewDescriptor;
    this.views.add(viewDescriptor);
  }

  registerNewModel(model, tag) {
    const id = ++this.header.idCounter;
    const viewDescriptor = {id, tag, model};
    model.meta = viewDescriptor;
    this.models.add(viewDescriptor);
  }

  serialize(modules) {
    return this.stateSerializer.serialize(this, modules);
  }

}