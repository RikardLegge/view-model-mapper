class ModuleSerializer {

  static add(name, serializer) {
    this.serializers.push({name, serializer});
  }

  serialize(module, modules) {
    const serializedData = {};

    ModuleSerializer.serializers.forEach(({name, serializer})=>{
      serializedData[name] = serializer(module, {modules});
    });

    return serializedData;
  }
}
ModuleSerializer.serializers = [];
