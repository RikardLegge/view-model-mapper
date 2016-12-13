function bindingEditor(editorModel, applicationModel) {
  editorModel.listen('target', () => {
    const target = editorModel.target;
    if(target){
      editorModel.target.element.style = 'background:rgba(200,200,100, .4)';

      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      editorModel.eventText = eventBinding ? eventBinding.path.join('.') : null;
      editorModel.modelText = modelBinding ? modelBinding.path.join('.') : null;
    } else {
      editorModel.eventText = null;
      editorModel.modelText = null;
    }
  });
  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);

  function updateEventBinding(){
    if (!editorModel.target || !editorModel.target.eventBinding) {
      return;
    }
    editorModel.target.eventBinding.signal = editorModel.eventText;
  }

  function updateModelBinding(){
    if (!editorModel.target || !editorModel.target.modelBinding) {
      editorModel.suggestions = [];
      return;
    }

    const targetPath = editorModel.modelText;
    const paths = ReflectModel.getPaths(applicationModel);

    editorModel.suggestions = paths
      .filter(path=>path.map(path => path.key).join('.').indexOf(targetPath) === 0)
      .map(path=>path.map(path => `<b>${path.key}</b>`).join('.') + ` => ${path[path.length-1].model[path[path.length-1].key]}`);

    const textPaths = paths.map(path=>path.map(path => path.key).join('.'));
    const index = textPaths.findIndex(path => path === targetPath);
    const path = paths[index];

    if (path) {
      const fullPath = path.map(path => path.key).join('.');

      if(fullPath === editorModel.target.modelBinding.path.join('.')){
        return;
      }

      editorModel.target.modelBinding.properties = path.pop();
      console.log(`Model set to ${fullPath}`);
    }
  }

  document.body.addEventListener('click', (event) => {
    if(event.altKey) {
      let element = findViewInPath(event.path);
      setTarget(element);
    }
  });

  function findViewInPath(path) {
    return path.find(element => {
      const view = element.boundView;
      if(view !== undefined){
        if(view.modelBinding || view.eventBinding){
          return true;
        }
      }

      return false;
    });
  }

  function setTarget(element) {

    if (editorModel.target) {
      const targetElement = editorModel.target.element;
      if(element === targetElement)
        return;
      editorModel.target.element.style = '';
    }

    if (element) {
      editorModel.target = element.boundView;
    } else {
      editorModel.target = null;
    }
  }

}