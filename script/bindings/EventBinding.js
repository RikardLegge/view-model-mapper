class EventBinding {

  constructor(model, signalHandler) {
    this.model = model;
    this.signalHandler = signalHandler;
  }

  dispose(){ }

  trigger() {
    this.signalHandler.execute(this.model, this.signalHandler.properties);
  }

  get path(){ return this.signalHandler.execute.__path;}
}