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

ViewFactory.create('checkbox', {modelBinding: new ModelBinding(applicationState.button, 'pressed')}, {}, {target: document.body});
ViewFactory.create('checkbox', {modelBinding: new ModelBinding(applicationState.button, 'pressed', v=>!v)}, {}, {target: document.body});
ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState.button, 'pressed')}, {}, {target: document.body});
ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState.button, 'pressed', v=>!v)}, {}, {target: document.body});
ViewFactory.create('text', {modelBinding: new ModelBinding(applicationState.button, 'pressed')}, {}, {target: document.body});

ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState.button, 'exampleText')}, {}, {target: document.body});

ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState, 'counter')}, {}, {target: document.body});
ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState, 'trippleCounter')}, {}, {target: document.body});
ViewFactory.create('text', {modelBinding: new ModelBinding(applicationState, 'counter')}, {}, {target: document.body});
ViewFactory.create('text', {modelBinding: new ModelBinding(applicationState, 'trippleCounter')}, {}, {target: document.body});
ViewFactory.create('button', {eventBinding: new EventBinding(applicationState, 'signal1', (key, model)=>model['counter']++)}, {}, {target: document.body});
ViewFactory.create('button', {eventBinding: new EventBinding(applicationState, 'signal1', (key, model)=>model['counter']--)}, {}, {target: document.body});

const labelContainer = ViewFactory.create('label', {}, { name: 'callstack__container' }, {target: document.body});
ViewFactory.create('label', {modelBinding: new ModelBinding(applicationState, 'log', a=>a.join('<br>'))}, { name: 'callstack' }, {target: labelContainer.element});

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
      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      editorModel.eventText = eventBinding ? eventBinding.getPath().join('.') : '[EventBinding UNAVAILABLE]';
      editorModel.modelText = modelBinding ? modelBinding.getPath().join('.') : '[ModelBinding UNAVAILABLE]';
    }
  });

  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);

  function updateEventBinding(){
    if (!editorModel.target || !editorModel.target.eventBinding) {
      modelInput.disable();
      return;
    }
    modelInput.enable();

    const signal = editorModel.eventText;
    editorModel.target.eventBinding.setModel({signal});
  }

  function updateModelBinding(){
    if (!editorModel.target || !editorModel.target.modelBinding) {
      modelInput.disable();
      return;
    }
    eventInput.enable();

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

      if(fullPath === editorModel.target.modelBinding.getPath().join('.')){
        return;
      }

      editorModel.target.modelBinding.setModel(path.pop());
      console.log(`Model set to ${fullPath}`);
    }
  }

  const modelInput = ViewFactory.create('text', {modelBinding: new ModelBinding(editorModel, 'modelText')}, { name: 'modelEditor' }, {target: document.body});
  const eventInput = ViewFactory.create('text', {modelBinding: new ModelBinding(editorModel, 'eventText')}, { name: 'eventEditor' }, {target: document.body});
  ViewFactory.create('label', {modelBinding: new ModelBinding(editorModel, 'suggestions', a=>a.join('<br>'))}, { name: 'modelEditor' }, {target: document.body});

  document.body.addEventListener('click', (event) => {
    let element = findViewInPath(event.path);
    setTarget(element);
  });

  function findViewInPath(path) {
    return path.find(element => element.__boundView !== undefined);
  }

  function setTarget(element) {

    if (element === modelInput.element || element === eventInput.element) {
      return;
    }

    if (editorModel.target) {
      editorModel.target.element.style = '';
    }

    if (element) {
      editorModel.target = element.__boundView;
      editorModel.target.element.style = 'background:rgba(200,200,100, .4)';
    } else {
      editorModel.target = null;
    }
  }
}

bindingEditor();
