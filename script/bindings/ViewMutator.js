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