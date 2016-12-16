class DataManager {
  constructor(data, metaKey) {
    this.data = [];
    this.metaKey = metaKey;

    data.forEach(it=>this.add(it));
  }

  add(value){
    this.data.push(value);
  }

  getList() {
    return this.data.map(it => it[this.metaKey]);
  }

  find(op) {
    const def = this.data.find(op);
    return def ? def[this.metaKey] : null;
  }

  remove(value) {
    const index = this.data.indexOf(value);
    if (index !== -1) {
      this.data.splice(index, 1);
    } else {
      console.warn(`Unable to find value to remove`, this.data, value);
    }
  }

  groupByTag(){
    return this.data.reduce((group, valueMeta) => {
      group[valueMeta.tag] = valueMeta[this.metaKey];
      return group;
    }, {});
  }

  findByTag(tag) {
    return this.find(it => it.tag === tag);
  }

  findById(id) {
    return this.find(it => it.id === id);
  }

}