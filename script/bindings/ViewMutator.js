class ViewMutator {

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