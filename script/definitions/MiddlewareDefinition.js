class MiddlewareDefinition extends Definition {
  constructor(){
    super();
    this.execute = ()=>{};
    this.properties = {};
  }
}

ModuleParser.add('middleware', ({middleware:obj})=>{
  const middlewareSet = {};

  obj.forEach(({id, path, properties})=>{
    const middleware = new MiddlewareDefinition();
    middleware.execute = ModuleParser.reducePath(Functions, path);
    middleware.properties = properties;
    const meta = {id, middleware};

    middlewareSet[id] = meta;
    middleware.meta = meta;
  });

  const middleware = new MiddlewareManager(Object.values(middlewareSet));
  return {data: middleware};
});

ModuleSerializer.add('middleware', ({middleware})=>{
  return middleware.data.map(({id, middleware}) => {
    const properties = middleware.properties;
    const path = middleware.execute.__path;
    return {id, path, properties};
  });
});