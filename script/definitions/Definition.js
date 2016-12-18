const definitionData = Symbol('definitionData');
class Definition {

  constructor(){
    this[definitionData] = {};
  }

  get meta(){
    return this[definitionData].meta;
  }

  set meta(value){
    this[definitionData].meta = value;
  }
}