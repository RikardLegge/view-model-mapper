class BindingEditorStyler {
  clear(name){
    const cls = `editor__${name}`;
    document
      .querySelectorAll(`.${cls}`)
      .forEach(e=>e.classList.remove(cls))
  }
  addStyle(view, name) {
    view.element.classList.add(`editor__${name}`);
  }

  removeStyle(view, name) {
    view.element.classList.remove(`editor__${name}`);
  }
}

class BindingEditor {
  constructor() {
    const editors = [ConsoleEditor];

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
    document.addEventListener('keydown', (e)=>{
      if(!this.editorModel.isEnabled)
        return;

      const target = this.editorModel.target;
      if(target) {
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            move(target.element, -1);
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            move(target.element, 1);
            break;
        }
      }

      function move(element, amt) {
        const parent = element.parentNode;
        const elements = [...parent.children];
        let index = elements.indexOf(element);
        index += amt;

        if(amt > 0)
          index += 1;

        if (index < 0 || index >= element.length - 1)
          return;

        parent.insertBefore(element, elements[index]);
      }
    });
    document.body.addEventListener('mousedown', (e)=>{
      if(!this.editorModel.isEnabled || false)
        return;

      if(e.button === 2 || this.editorModel.moveTarget)
        return;

      const closest = this.findClosestViewBoundElement(e.target);
      this.setMoveTarget(closest);
    });
    document.body.addEventListener('mouseup', (e)=>{
      if(!this.editorModel.isEnabled || false)
        return;

      if(e.button === 2 || !this.editorModel.moveTarget)
        return;

      this.setMoveTarget(null);
    });
    document.body.addEventListener('mousemove', (e)=>{
      if(!this.editorModel.isEnabled || false)
        return;

      if(e.button === 2)
        return;

      const view = this.editorModel.moveTarget;
      if(!view)
        return;

      const closest = this.findClosestViewBoundElement(e.target, view);
      if(!closest)
        return;

      const parent = closest.boundView;
      if(view.parentView === parent)
        return;

      if(parent.isDescendantOf(view))
        return;

      const viewModule = this.modules.findByView(view);
      const parentModule = this.modules.findByView(parent);

      if(parent.ports.length === 0){
        console.log(`Move target must have ports`);
        return;
      }

      if(viewModule !== parentModule){
        console.log('Moving views between modules will reset it"s model binding');

        view.eventBinding && view.eventBinding.dispose();
        view.modelBinding && view.modelBinding.dispose();

        view.eventBinding = null;
        view.modelBinding = null;

        viewModule.detachView(view);
        parentModule.attachView(view);
      }

      view.parentView = {view: parent, port: 0};
      e.preventDefault();
    });

    document.body.addEventListener('contextmenu', (e)=>{
      if(!this.editorModel.isEnabled)
        return;

      const closest = this.findClosestViewBoundElement(e.target);

      e.preventDefault();

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
      this.style.clear(name);
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

  findClosestViewBoundElement(element, ignoredView) {
    while (element) {
      if (element.boundView && element.boundView !== ignoredView) {
        return element;
      } else {
        element = element.parentNode;
      }
    }
  }

  propagateTargetChange() {
    return false;
    const editorModel = this.editorModel;
    const target = editorModel.target;

    if (target) {
      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      const viewMeta = target.meta;
      const eventBindingModelMeta = eventBinding ? eventBinding.model.meta : {};

      // editorModel.viewProperties = `id: ` + viewMeta.id;
      // editorModel.eventText = eventBinding ? eventBinding.path.join('.') : null;
      // editorModel.modelText = modelBinding ? getModelPathName(modelBinding) : null;
      // editorModel.eventModelIdText = eventBindingModelMeta.tag || null;
      // editorModel.templateText = target.templateProperties.name;
    } else {
      // editorModel.suggestions = [];
      // editorModel.viewProperties = null;
      // editorModel.eventText = null;
      // editorModel.modelText = null;
      // editorModel.eventModelIdText = null;
      // editorModel.templateText = null;
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

class ConsoleEditor {

  constructor(){ }

  setEditorModel(editorModel){
    this.editorModel = editorModel;
    this.editorModel.listen('target', ()=>this.render());
  }

  render(){
    console.clear();
    const target = this.editorModel.target;

    if(target){
      this.renderViewDefinition(target);
    } else {
      delete window.view;
      delete window.models;
      delete window.ui;
    }
  }

  renderBasic(def){
    console.log(`View Id:`, def.meta.id, 'Type:', 'UI.'+def.__path.join('.'));
    console.log(`Element:`, def.element);
  }

  generateModules() {
    return this.modules.modules.reduce((modules, module, index)=>{
      const key = module.header.tag || `unknown${index}`;

      modules[key] = this.generateModels(module);

      return modules;
    }, Null({}));
  }

  renderBindings(def){
    const modelBinding = def.modelBinding;
    console.log("ModelBinding: ", {
      model: getTag(modelBinding),
      key: getKey(),
      get $value(){
        return modelBinding.value;
      },
      set $value(value){
        modelBinding.value = value;
      },
      get $path(){
        return `${getTag(modelBinding)}.${getKey()}`
      },
      set $path(val){
        view.set.model(val);
    }});


    const eventBinding = def.eventBinding;
    console.log("EventBinding: ", {
      model: getTag(eventBinding),
      signal: getSignal(),
      get $path(){
        return getSignal()
      },
      set $path(value){
        view.set.event(value);
      }});

    function getKey(){
      return modelBinding
        ? modelBinding.key
        : 'NONE';
    }

    function getSignal(){
      return eventBinding && eventBinding.signalHandler
        ? eventBinding.signalHandler.execute.__path.join('.')
        : 'NONE';
    }
    function getTag(binding){
      return binding && binding.model
        ? binding.model.meta.tag
        : 'NONE';
    }
  }

  generateModels(module){
    const moduleDef = module.models.data.reduce((models, model)=>{
      const original = model.model;
      const tag = model.tag;
      const modelDef = Object.entries(original).reduce((model, [key, value])=>{
        if(original.hasOwnProperty(key)){
          Object.defineProperty(model, key, {
            get(){
              return `${tag}.${key}|=>${value}`
            },
            set(value){
              if(original.hasOwnProperty(key)) {
                original[key] = value;
              }
            }
          });
        }
        return model;
      }, Null({}));
      modelDef.$define = prop(([key])=>{
        if(!original.hasOwnProperty(key)){
          original.addValueProperty(key, null);
          this.render();
        } else {
          console.warn('Key already exists', key);
        }
      });
      models[tag] = modelDef;
      return models
    }, Null({}));

    const saveModule = ()=>{
      modulePersistor.save(module.header.tag, module, this.modules);
    };

    const loadModule = ()=>{
      const modules = this.modules.modules;
      const tag = module.header.tag;
      module.unload();

      const index = modules.indexOf(module);
      if(index >= 0)
        modules.splice(index, 1);

      const loadedModule = modulePersistor.load(tag, modules);
      modules.push(loadedModule);
      module = null;

      if(tag === 'editor') {
        const model = loadedModule.models.findByTag(tag);
        bindingEditor.setModule(model, this.modules);
      }
    };

    moduleDef.$save = saveModule;
    moduleDef.$load = loadModule;
    moduleDef.$head = module.header;
    return moduleDef;
  }

  generateUI(){
    return Null({
      checkbox: 'checkbox',
      group: 'group'
    });
  }

  generateView(def) {
    const editorModel = this.editorModel;
    const target = editorModel.target;

    const setValues = Null({
      event: prop(keys=>{
        const method = ModuleParser.reducePath(Functions, keys);
        const binding = {execute: method};

        if(keys.length > 0 && typeof method === "function"){
          if(target.eventBinding) {
            target.eventBinding.model = null;
            target.eventBinding.signalHandler = binding;
          } else {
            target.eventBinding = new EventBinding(null, binding);
          }
        }

        this.render();

      }),
      model: prop(keys => {
        if(keys.length === 0) {
          if(target.modelBinding)
            target.modelBinding = null;
        } else if(keys.length === 1) {
          const property = keys[0];
          if(!target.modelBinding || !target.modelBinding.model)
            return console.warn(`A single parameter is treated as a property, please specify a full model property path`);

          if(!target.modelBinding.model.hasOwnProperty(property))
            return console.warn(`The property ${property} does not exist on the model`);

          target.modelBinding.key = property;
        } else if(keys.length === 2) {
          const module = this.modules.findByView(target);
          const tagOrId = keys[0];
          const property = keys[1];
          const binding = target.modelBinding || new ModelBinding();

          const model =
            module.models.findByTag(tagOrId) ||
            module.models.findById(tagOrId | 0);

          if(!model.hasOwnProperty(property))
            return console.warn(`The property ${property} does not exist on the model`);

          binding.properties = {model, key: property};

          if(!target.modelBinding)
            target.modelBinding = binding;
        }

        this.render();
      }),
      ['class']: prop(([key]) => {
        target.templateProperties.name = key;
        target.redrawElement();
        this.render();
      })
    });

    return Null({
      ['delete']: () => {
        applicationF.removeView(editorModel)
      },
      add(list, ...values){
        list = [].concat(list);
        const type = list.join('') + values.join('');
        applicationF.addView({type, editor: editorModel});
      },
      set: setValues,

      get parent(){
        editorModel.target = target.parentView;
      },
      get children(){
        return target.children;
      }
    });
  }

  renderViewDefinition(def){
    this.renderBasic(def);
    window.models = this.generateModels(this.modules.findByView(def));
    window.ui = this.generateUI();
    window.view = this.generateView(def);
    window.modules = this.generateModules();
    this.renderBindings(def);
  }

  setModules(modules){
    this.modules = modules;
    window.modules = this.generateModules();
  }
}

function prop(func){
  return function(...param){
    const values = [];
    addValue(param);

    setTimeout(()=>{
      func(values);
    }, 0);

    return next;

    function next(...param){
      addValue(param);
      return next;
    }

    function addValue(param){
      let [list, ...rest] = param;
      list = [].concat(list);

      let value = list.join('') + rest.join('');
      value = value.split('|')[0];

      values.push(...value.split('.'));
    }
  }
}

function Null(obj={}){
  obj.__proto__ = null;
  return obj;
}