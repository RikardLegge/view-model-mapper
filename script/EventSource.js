const triggers = Symbol();

class EventSource {
  constructor(){
    this[triggers] = [];
  }

  listen(glob, onChange) {
    this[triggers].push({glob, onChange});
  }

  unListen(_glob, _onChange) {
    let index;
    while((index = this[triggers].findIndex(({glob, onChange})=>glob === _glob && onChange === _onChange)) !== -1){
      this[triggers].splice(index, 1);
    }
  }

  trigger(key, value) {
    this[triggers]
      .filter(({glob}) => glob == key)
      .forEach(({onChange}) => onChange(key, value));
  }
}
