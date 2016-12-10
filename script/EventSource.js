const triggers = Symbol();
const callstack = Symbol();

class EventSource {
  constructor(){
    this[triggers] = [];
    this[callstack] = [];
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

  getParent() {
    return {};
  }

  trigger(key, value) {
    if(this[callstack].indexOf(key) !== -1){
      this[callstack] = [];
      return;
    }
    this[callstack].push(key);

    this[triggers]
      .filter(({glob}) => checkGlob(glob, key))
      .forEach(({onChange}) => onChange(key, value, this));

    const {model: parent, key: parentKey} = this.getParent();
    if(parent && parent instanceof EventSource){
      parent.trigger(`${parentKey}.${key}`, value, this);
    }

    this[callstack].pop();
  }
}

function checkGlob(glob, key){
  if(glob === '*'){
    return true;
  }

  if(key === glob){
    return true;
  }

  return false;
}