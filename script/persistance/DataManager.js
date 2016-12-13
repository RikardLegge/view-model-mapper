class DataManager {
  constructor(data, metaKey){
    this.data = data;
    this.metaKey = metaKey;
  }

  getList(){
    return this.data.map(it=>it[this.metaKey]);
  }

  find(op){
    const def = this.data.find(op);
    return def ? def[this.metaKey] : null;
  }

  findByTag(tag){
    return this.find(it=>it.tag === tag);
  }

  findById(id){
    return this.find(it=>it.id === id);
  }

  getMeta(target) {
    return this.data.find(data=>data[this.metaKey] === target);
  }
}