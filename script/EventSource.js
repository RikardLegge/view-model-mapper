const triggers = Symbol();
const callStack = Symbol();
const allowEventBubbling = Symbol();

class EventSource {
  constructor(){
    this[triggers] = [];
    this[callStack] = [];
    this[allowEventBubbling] = true;
  }

  listen(glob, onChange) {
    this[triggers].push({glob, onChange});

    if(glob.indexOf('*') === -1) {
      const value = this.getValue(glob);
      onChange(glob, value, this);
    }
  }

  unListen(_glob, _onChange) {
    let index;
    while((index = this[triggers].findIndex(({glob, onChange})=>glob === _glob && onChange === _onChange)) !== -1){
      this[triggers].splice(index, 1);
    }
  }

  getValue() {
    return null;
  }

  getParent() {
    return {};
  }

  trigger(key, value) {
    if(this[callStack].indexOf(key) !== -1){
      this[callStack] = [];
      return;
    }
    this[callStack].push(key);

    this[triggers]
      .filter(({glob}) => checkGlob(glob, key))
      .forEach(({onChange}) => onChange(key, value, this));

    if(this[allowEventBubbling]) {
      const {model: parent, key: parentKey} = this.getParent();
      if (parent instanceof EventSource) {
        parent.trigger(`${parentKey}.${key}`, value, this);
      }
    }

    this[callStack].pop();
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