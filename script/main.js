// Define state

const buttonState = new Model({
  pressed: false,
  valid: true,
  invalid: false,
  exampleText: 'Press me! Then change "button.exampleText" to "frameCount"'
});

const applicationState = new Model({
  button: buttonState,
  frameCount: 0,
  counter: 1,
  log: []
});

applicationState.attachProperties({
  trippleCounter: {
    get: data => data.counter * 3,
    set: (data, value) => data.counter = value / 3,
    dependencies: ['counter']
  }
});

requestAnimationFrame(function frame(){
  applicationState.frameCount++;
  requestAnimationFrame(frame);
});

// Construct UI

const viewRoot = new ViewDefinition().construct(document.body);

UI.default.checkbox.create({ modelBinding: new ModelBinding(applicationState.button, 'pressed'), parentView: viewRoot });
UI.default.checkbox.create({ modelBinding: new ModelBinding(applicationState.button, 'pressed', v=>!v), parentView: viewRoot });
UI.default.label.create({ modelBinding: new ModelBinding(applicationState.button, 'pressed'), parentView: viewRoot });
UI.default.label.create({ modelBinding: new ModelBinding(applicationState.button, 'pressed', v=>!v), parentView: viewRoot });
UI.default.text.create({ modelBinding: new ModelBinding(applicationState.button, 'pressed'), parentView: viewRoot });

UI.default.label.create({ modelBinding: new ModelBinding(applicationState.button, 'exampleText'), parentView: viewRoot });

UI.default.label.create({ modelBinding: new ModelBinding(applicationState, 'counter'), parentView: viewRoot });
UI.default.text.create({ modelBinding: new ModelBinding(applicationState, 'counter'), parentView: viewRoot });
UI.default.label.create({ modelBinding: new ModelBinding(applicationState, 'trippleCounter'), parentView: viewRoot });
UI.default.text.create({ modelBinding: new ModelBinding(applicationState, 'trippleCounter'), parentView: viewRoot });

UI.default.button.create({ eventBinding: new EventBinding(applicationState, 'signal1', (key, model)=>model['counter']++), parentView: viewRoot });
UI.default.button.create({ eventBinding: new EventBinding(applicationState, 'signal1', (key, model)=>model['counter']--), parentView: viewRoot });

const labelContainer = UI.default.label.create({parentView: viewRoot, properties: { name: 'callstack__container' } });
UI.default.label.create({ modelBinding: new ModelBinding(applicationState, 'log', a=>a.join('<br>')), parentView: labelContainer, properties: { name: 'callstack' } });

applicationState.listen('*', (key, value, state)=> key !== 'log' && key !== 'frameCount' &&
  (state.log = [...state.log, `<b>${key}</b> => ${value}`]));

// Create the UI editor

function bindingEditor() {

  const editorModel = new Model({
    modelText: '',
    eventText: '',
    target: null,
    suggestions: []
  });

  editorModel.listen('target', () => {
    const target = editorModel.target;
    if(target){
      const modelBinding = target.getModelBinding();
      const eventBinding = target.getEventBinding();

      editorModel.eventText = eventBinding ? eventBinding.getPath().join('.') : '[EventBinding UNAVAILABLE]';
      editorModel.modelText = modelBinding ? modelBinding.getPath().join('.') : '[ModelBinding UNAVAILABLE]';
    } else {
      editorModel.eventText = '';
      editorModel.modelText = '';
    }
  });

  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);

  function updateEventBinding(){
    if (!editorModel.target || !editorModel.target.getEventBinding()) {
      eventInput.disable();
      return;
    }
    eventInput.enable();

    const signal = editorModel.eventText;
    editorModel.target.getEventBinding().setModel({signal});
  }

  function updateModelBinding(){
    if (!editorModel.target || !editorModel.target.getModelBinding()) {
      editorModel.suggestions = [];
      modelInput.disable();
      return;
    }
    modelInput.enable();

    const targetPath = editorModel.modelText;
    const paths = ReflectModel.getPaths(applicationState);

    editorModel.suggestions = paths
      .filter(path=>path.map(path => path.key).join('.').indexOf(targetPath) === 0)
      .map(path=>path.map(path => `<b>${path.key}</b>`).join('.') + ` => ${path[path.length-1].model[path[path.length-1].key]}`);

    const textPaths = paths.map(path=>path.map(path => path.key).join('.'));
    const index = textPaths.findIndex(path => path === targetPath);
    const path = paths[index];

    if (path) {
      const fullPath = path.map(path => path.key).join('.');

      if(fullPath === editorModel.target.getModelBinding().getPath().join('.')){
        return;
      }

      editorModel.target.getModelBinding().setModel(path.pop());
      console.log(`Model set to ${fullPath}`);
    }
  }

  const modelInput = UI.default.text.create({ modelBinding: new ModelBinding(editorModel, 'modelText'), properties: { name: 'modelEditor' }, parentView: viewRoot });
  const eventInput = UI.default.text.create({ modelBinding: new ModelBinding(editorModel, 'eventText'), properties: { name: 'eventEditor' }, parentView: viewRoot });
  UI.default.label.create({ modelBinding: new ModelBinding(editorModel, 'suggestions', a=>a.join('<br>')), properties: { name: 'modelEditor' }, parentView: viewRoot });

  document.body.addEventListener('click', (event) => {
    let element = findViewInPath(event.path);
    setTarget(element);
  });

  function findViewInPath(path) {
    return path.find(element => {
      const view = element.boundView;
      if(view !== undefined){
        if(view.getModelBinding() || view.getEventBinding()){
          return true;
        }
      }

      return false;
    });
  }

  function setTarget(element) {

    if (element === modelInput.getElement() || element === eventInput.getElement()) {
      return;
    }

    if (editorModel.target) {
      editorModel.target.getElement().style = '';
    }

    if (element) {
      editorModel.target = element.boundView;
      editorModel.target.getElement().style = 'background:rgba(200,200,100, .4)';
    } else {
      editorModel.target = null;
    }
  }
}

bindingEditor();
