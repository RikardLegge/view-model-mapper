class Module {

  constructor() {
    this.stateParser = new ModuleParser();
    this.stateSerializer = new ModuleSerializer();
    this.header = {};
    this.models = null;
    this.views = null;
  }

  load(obj) {
    const {header, models, views} = this.stateParser.parse(obj);
    this.header = header;
    this.models = models;
    this.views = views;
  }

  addView(view) {
    const id = ++this.header.idCounter;
    const viewDescriptor = {id, view};
    this.views.views.push(viewDescriptor);
  }

  serialize() {
    return this.stateSerializer.serialize(this);
  }

}