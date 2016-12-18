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

ViewDefinition.addComponent({
  name: 'eventBinding',
  methods: {
    viewSignal: function() {
      const binding = this.eventBinding;
      binding && binding.trigger();
    }
  },
});