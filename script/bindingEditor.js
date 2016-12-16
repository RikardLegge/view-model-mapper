class BindingEditorStyler {
  apply(view) {
    view.element.style = 'box-shadow: inset 0 0 0 2px orange, 0 0 0 2px red';
  }

  unApply(view) {
    view.element.style = '';
  }
}

class BindingEditor {
  constructor() {
    const editors = [EventBindingEditor, ModelBindingEditor, ViewBindingEditor];

    this.editorModel = null;
    this.style = new BindingEditorStyler();
    this.editors = editors.map(Editor=>new Editor(this));
    this.modules = null;
  }

  setModule(editorModel, modules){
    this.modules = modules;
    this.editorModel = editorModel;
    this.editors.forEach(editor=>{
      editor.setModules(modules);
      editor.setEditorModel(this.editorModel);
    });

    editorModel.listen('target', ()=>this.propagateTargetChange());
  }

  attach() {
    document.body.addEventListener('mousemove', event => this.trySetTargetFromEvent(event));
  }

  trySetTargetFromEvent(event) {
    if (event.shiftKey) {
      const {pageX: x, pageY: y} = event;
      const element = document.elementFromPoint(x, y);
      const viewBoundElement = this.findClosestViewBoundElement(element);

      this.setTarget(viewBoundElement);
    }
  }

  setTarget(element) {
    const editorModel = this.editorModel;
    if (editorModel.target) {
      const targetElement = editorModel.target.element;
      if (element === targetElement) {
        return;
      }
      this.style.unApply(this.editorModel.target);
    }

    if (element && element !== document.body) {
      editorModel.target = element.boundView;
    } else {
      editorModel.target = null;
    }
  }

  findClosestViewBoundElement(element) {
    while (element) {
      if (element.boundView) {
        return element;
      } else {
        element = element.parentNode;
      }
    }
  }

  propagateTargetChange() {
    const editorModel = this.editorModel;
    const target = editorModel.target;

    if (target) {
      const module = this.modules.findByView(editorModel.target);

      this.style.apply(target);

      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      const viewMeta = module.views.getMeta(target);
      const eventBindingModelMeta = eventBinding ? module.models.getMeta(eventBinding.model) : {};

      editorModel.viewProperties = `id: ` + viewMeta.id;
      editorModel.eventText = eventBinding ? eventBinding.path.join('.') : null;
      editorModel.modelText = modelBinding ? getModelPathName(module, modelBinding) : null;
      editorModel.eventModelIdText = eventBindingModelMeta.tag || null;
      editorModel.templateText = target.templateProperties.name;
    } else {
      editorModel.eventText = null;
      editorModel.modelText = null;
      editorModel.templateText = null;
      editorModel.eventModelIdText = null;
    }

    function getModelPathName(module, binding) {
      const {tag: tagName} = module.models.getMeta(binding.model);
      const property = binding.path[binding.path.length - 1];

      return `${tagName}.${property}`;
    }
  }
}



class ViewBindingEditor {

  constructor({style}){
    this.style = style;
  }

  setEditorModel(editorModel){
    this.editorModel = editorModel;
    this.editorModel.listen('templateText', ()=>this.edit());
  }

  setModules(modules){
    this.modules = modules;
  }

  edit() {
    const editorModel = this.editorModel;
    const target = editorModel.target;
    if (target && target.templateProperties.name !== editorModel.templateText) {
      target.templateProperties.name = editorModel.templateText;
      target.redrawElement();
      this.style.apply(target);
    }
  }
}

function reduceObject(root, path){
  return path.reduce((root, path)=>root && root[path], root);
}

function getSuggestions(root, path){
  const {obj, usedPath, restPath} = reducePath(root, path);

  if(restPath.length === 0){
    return joinValues([usedPath]);
  } else if(obj && restPath.length === 1) {
    const keys = Object.keys(obj).filter(key=>key.indexOf('__') !== 0);
    const suggestions = keys
      .filter(key=>key.indexOf(restPath[0]) === 0)
      .map(key=>[...usedPath, key]);
    if(suggestions.length > 0){
      return joinValues(suggestions);
    }
  }
  return [];

  function joinValues(suggestions){
    return suggestions.map(path=>{
      const value = reduceObject(root, path);
      const formattedValue = formatSuggestion(path, value);
      return {
        path, value, formattedValue
      };
    });
  }

  function formatSuggestion(path, value){
    const key = path.join('.');

    let formattedValue = value;
    if(typeof value === 'function')
      formattedValue = `Function(){...}`;
    else if(value instanceof Object)
      formattedValue = `[...]`;
    return `<b>${key}</b> => ${formattedValue}`;
  }

  function reducePath(parent, paths){
    let i;
    for(i = 0; i < paths.length; i++){
      const path = paths[i];
      if(parent.propertyIsEnumerable(path) && parent[path] instanceof Object){
        parent = parent[path];
      } else{
        break;
      }
    }
    return {
      obj: parent,
      usedPath: path.slice(0,i),
      restPath: paths.slice(i)
    };
  }
}

class EventBindingEditor {

  setEditorModel(editorModel){
    this.editorModel = editorModel;
    this.editorModel.listen('eventText', ()=>this.refreshSuggestions());
    this.editorModel.listen('applyEventModelIdText', ()=>this.updateModel());
    this.editorModel.listen('applyEventText', ()=>this.autoComplete());
  }

  updateModel(){
    const editorModel = this.editorModel;
    const target = editorModel.target;
    if(target && target.eventBinding) {
      const binding = target.eventBinding;
      const currentModule = binding.model;
      const module = this.modules.findByModel(currentModule);
      const models = module.models.models.reduce((models, model)=>(models[model.tag] = model, models), {});
      const tag = editorModel.eventModelIdText;

      const suggestions = getSuggestions(models, [tag]);

      const suggestion = suggestions.length === 1
        ? suggestions[0]
        : null;

      if (suggestion && suggestion.path.length === 1) {
        const currentModuleMeta = module.models.getMeta(currentModule);
        const oldModelId = currentModuleMeta.id;
        const oldTag = currentModuleMeta.tag;

        const newModel = suggestion.value.model;
        const modelId = suggestion.value.id;
        const tag = suggestion.value.tag;

        if (oldModelId == modelId) {
          return;
        }

        binding.model = newModel;
        console.log(`Model set to ${tag} from ${oldTag}`);
        editorModel.eventModelIdText = tag;
      }
    }
  }

  setModules(modules){
    this.modules = modules;
  }

  autoComplete() {
    const editorModel = this.editorModel;

    const suggestions = this.getSuggestions();
    const suggestion = suggestions.length === 1
      ? suggestions[0]
      : null;

    if (suggestion && suggestion.path.length >= 2) {
      const target = editorModel.target;
      const binding = target.eventBinding;

      const fullPath = suggestion.path.join('.');
      const previousFullPath = binding.signalHandler.execute.__path.join('.');

      const func = reduceObject(Functions, suggestion.path);

      if (fullPath === previousFullPath) {
        return;
      }

      binding.signalHandler.execute = func;
      console.log(`Model set to ${fullPath} from ${previousFullPath}`);
      editorModel.eventText = fullPath;
    }
  }

  refreshSuggestions() {
    const editorModel = this.editorModel;

    if (editorModel.target && editorModel.target.eventBinding) {
      const suggestions = this.getSuggestions();

      editorModel.suggestions = suggestions.map(s => s.formattedValue);
    }
  }

  getSuggestions(){
    const editorModel = this.editorModel;
    const text = editorModel.eventText || '';
    const path = text.split('.');

    return getSuggestions(Functions, path);
  }
}

class ModelBindingEditor {

  setEditorModel(editorModel){
    this.editorModel = editorModel;
    this.editorModel.listen('modelText', ()=>this.refreshSuggestions());
    this.editorModel.listen('applyModelText', ()=>this.autoComplete());
  }

  setModules(modules){
    this.modules = modules;
  }

  autoComplete(){
    const editorModel = this.editorModel;

    const suggestions = this.getSuggestions();
    const suggestion = suggestions.length === 1
      ? suggestions[0]
      : null;

    if (suggestion && suggestion.path.length >= 2) {
      const module = this.getModule();
      const keyedModels = this.getKeyedModels();
      const binding = editorModel.target.modelBinding;

      const fullPath = suggestion.path.join('.');
      const previousFullPath = module.models.getMeta(binding.model).tag + `.` + binding.path.pop();

      const key = suggestion.path.pop();
      const model = reduceObject(keyedModels, suggestion.path);

      if (fullPath === previousFullPath) {
        return;
      }

      editorModel.target.modelBinding.properties = {model, key};
      console.log(`Model set to ${fullPath} from ${previousFullPath}`);
      editorModel.modelText = fullPath;
    }
  }

  refreshSuggestions() {
    const editorModel = this.editorModel;

    if (editorModel.target && editorModel.target.modelBinding) {
      const suggestions = this.getSuggestions();

      editorModel.suggestions = suggestions.map(s => s.formattedValue);
    }
  }

  getSuggestions(){
    const editorModel = this.editorModel;
    const text = editorModel.modelText || '';
    const path = text.split('.');
    const keyedModels = this.getKeyedModels();

    return getSuggestions(keyedModels, path);
  }


  getModule(){
    const editorModel = this.editorModel;
    return this.modules.findByView(editorModel.target);
  }

  getKeyedModels(){
    return this.modules.getKeyedModels(this.getModule());
  }
}
