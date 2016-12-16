class LocalStoragePersistor {

  constructor() { }

  save(key, module, modules) {
    const json = JSON.stringify(module.serialize(modules));
    localStorage.setItem(key, json);
  }

  load(key, modules, defaultModule) {
    const module = new Module();

    const storedState = localStorage.getItem(key);
    const persistedState = storedState
      ? JSON.parse(storedState)
      : defaultModule;

    module.load(persistedState, modules);

    return module;
  }

  clean(key) {
    localStorage.removeItem(key);
  }
}