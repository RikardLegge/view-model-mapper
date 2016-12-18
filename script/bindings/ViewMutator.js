class ViewMutator {
  constructor({execute, properties}){
    this.execute = execute;
    this.properties = properties;
  }
}

ViewDefinition.addComponent({
  name: 'viewMutator',
  set: function(data, value, key) {
    data[key] = value;

    const {mutator, binding} = data;

    if (mutator && binding)
      mutator.execute(this, data.modelBinding.model, this.viewMutator.properties);
  },

});

ModuleParser.add('viewMutators', ({viewMutators: obj}, {parsed:{views}})=> {
  if (!views)
    return false;

  obj.forEach(({view:{id:viewId}, mutator:{path, properties={}}}) => {
    const viewMutator = ModuleParser.reducePath(Functions, path);
    const view = views.findById(viewId);

    assert(view, `No view found when parsing view mutators`);

    view.viewMutator = new ViewMutator({execute: viewMutator, properties});
  });
});

ModuleSerializer.add('viewMutators', ({views})=>{
  return views.getList()
    .filter(view => !!view.viewMutator)
    .map(view => {
      const {id} = view.meta;
      const mutator = view.viewMutator;
      const properties = mutator.properties;
      const path = mutator.execute.__path;

      return {view: {id}, mutator: {path, properties}};
    });
});