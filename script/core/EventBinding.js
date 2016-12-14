class EventBinding {

  constructor(model, signal, signalHandler) {
    Object.assign(this, {model, signal, signalHandler});
  }

  trigger() {
    this.signalHandler(this.signal, this.model);
  }

}

Object.defineProperties(EventBinding.prototype, {
  path: {
    get(){ return [...this.model.path, this.signal]; }
  }
});