class BindingEditorStyler {
  addStyle(view, name) {
    view.element.classList.add(`editor__${name}`);
  }

  removeStyle(view, name) {
    view.element.classList.remove(`editor__${name}`);
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

    editorModel.listen('target', ()=>{
      this.applyTargetStyle(editorModel.target, 'target');
      this.propagateTargetChange();
    });

    editorModel.listen('moveTarget', ()=>{
      this.applyTargetStyle(editorModel.moveTarget, 'moveTarget');
    });
  }

  attach() {
    document.body.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      const closest = this.findClosestViewBoundElement(e.target);

      if(e.shiftKey) {
        this.setMoveTarget(closest);
      } else {
        this.setTarget(closest);
      }
    });
  }

  setMoveTarget(element){
    const editorModel = this.editorModel;
    const target = editorModel.moveTarget;

    this.unApplyTargetStyle(element, target, 'moveTarget');

    editorModel.moveTarget = (element && element !== document.body)
      ? element.boundView
      : null;
  }

  unApplyTargetStyle(element, target, name) {
    if (target) {
      const targetElement = target.element;
      if (element === targetElement) {
        return;
      }
      this.style.removeStyle(target, name);
    }
  }

  applyTargetStyle(target, name){
    if(target){
      this.style.addStyle(target, name);
    }
  }

  setTarget(element) {
    const editorModel = this.editorModel;
    const target = editorModel.target;

    this.unApplyTargetStyle(element, target, 'target');

    editorModel.target = (element && element !== document.body)
      ? element.boundView
      : null;
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
      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      const viewMeta = target.meta;
      const eventBindingModelMeta = eventBinding ? eventBinding.model.meta : {};

      editorModel.viewProperties = `id: ` + viewMeta.id;
      editorModel.eventText = eventBinding ? eventBinding.path.join('.') : null;
      editorModel.modelText = modelBinding ? getModelPathName(modelBinding) : null;
      editorModel.eventModelIdText = eventBindingModelMeta.tag || null;
      editorModel.templateText = target.templateProperties.name;
    } else {
      editorModel.suggestions = [];
      editorModel.viewProperties = null;
      editorModel.eventText = null;
      editorModel.modelText = null;
      editorModel.eventModelIdText = null;
      editorModel.templateText = null;
    }

    function getModelPathName(binding) {
      const {tag: tagName} = binding.model.meta;
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
      this.style.addStyle(target);
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
      const models = module.models.groupByTag();
      const tag = editorModel.eventModelIdText;

      const suggestions = getSuggestions(models, [tag]);

      const suggestion = suggestions.length === 1
        ? suggestions[0]
        : null;

      if (suggestion && suggestion.path.length === 1) {
        const currentModuleMeta = currentModule.meta;
        const oldModelId = currentModuleMeta.id;
        const oldTag = currentModuleMeta.tag;

        const newModelMeta = suggestion.value.meta;
        const newModel = newModelMeta.model;
        const modelId = newModelMeta.id;
        const tag = newModelMeta.tag;

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
      const keyedModels = this.getKeyedModels();
      const binding = editorModel.target.modelBinding;

      const fullPath = suggestion.path.join('.');
      const previousFullPath = binding.model.meta.tag + `.` + binding.path.pop();

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

  getKeyedModels() {
    const module = this.getModule();
    return module
      ? module.models.groupByTag()
      : {};
  }
}
