class LocalStoragePersistor {

  constructor(defaultState){
    this.defaultState = defaultState;
    this.module = null;
  }

  save(){
    const json = JSON.stringify(this.module.serialize());
    localStorage.setItem('state', json);
  }

  load(){
    this.module = new Module();

    const storedState = localStorage.getItem('state');
    const persistedState = storedState
      ? JSON.parse(storedState)
      : this.defaultState;

    document.body.innerHTML = '';
    this.module.load(persistedState);

    return this.module;
  }

  clean(){
    localStorage.removeItem('state');
  }
}