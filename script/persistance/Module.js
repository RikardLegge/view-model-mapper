class Module {

  constructor(){
    this.stateParser = new ModuleParser();
    this.stateSerializer = new ModuleSerializer();
    this.header = {};
    this.models = [];
    this.views = [];
  }

  load(obj) {
    const {header, models, views} = this.stateParser.parse(obj);
    this.header = header;
    this.models = models;
    this.views = views;
  }

  serialize() {
    return this.stateSerializer.serialize(this);
  }

}