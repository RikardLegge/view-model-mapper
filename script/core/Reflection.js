class ReflectModel {
  static getPaths(model, root = []) {
    const deep = root !== false;
    return Object.entries(model).reduce((paths, [key, value]) => {
      let path;
      if (deep) {
        path = [...root, {model, key}];

        if (value instanceof Model) {
          paths.push(...ReflectModel.getPaths(value, path))
        }
      } else {
        path = {model, key};
      }
      paths.push(path);
      return paths;
    }, []);
  }
}