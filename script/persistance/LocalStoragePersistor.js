class LocalStoragePersistor {

  constructor() { }

  save(key, module) {
    const json = JSON.stringify(module.serialize());
    localStorage.setItem(key, json);
  }

  load(key, defaultModule) {
    const module = new Module();

    const storedState = localStorage.getItem(key);
    const persistedState = storedState
      ? JSON.parse(storedState)
      : defaultModule;

    module.load(persistedState);

    return module;
  }

  clean(key) {
    localStorage.removeItem(key);
  }
}