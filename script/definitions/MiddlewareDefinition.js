class MiddlewareDefinition extends Definition {
  constructor(){
    super();
    this.execute = ()=>{};
    this.properties = {};
  }
}

ModuleSerializer.add('middleware', ({middleware})=>{
  return middleware.data.map(({id, middleware}) => {
    const properties = middleware.properties;
    const path = middleware.execute.__path;
    return {id, path, properties};
  });
});