class ReflectModel {
  static getPaths(model, root=[]){
    return Object.entries(model).reduce((paths, [key, value])=>{
      let path = [...root, {model, key}];

      if(value instanceof Model){
        paths.push(...ReflectModel.getPaths(value, path))
      }
      paths.push(path);
      return paths;
    }, []);
  }
}