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
  counter: 1
});

applicationState.attachProperties({
  doubleCounter: data => data.counter * 2,
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

// Create the UI editor

function bindingEditor() {

  const editorModel = new Model({
    text: '',
    target: null,
    suggestions: []
  });

  editorModel.listen('target', () => {
    editorModel.text = editorModel.target && editorModel.target.modelBinding ? editorModel.target.modelBinding.getPath().join('.') : '';
  });

  editorModel.listen('text', () => {
    if (!editorModel.target) {
      return;
    }

    const paths = ReflectModel.getPaths(applicationState);

    editorModel.suggestions = paths
      .filter(path=>path.map(path => path.key).join('.').indexOf(editorModel.text) === 0)
      .map(path=>path.map(path => path.key).join('.') + ' => ' + path[path.length-1].model[path[path.length-1].key]);

    const textPaths = paths.map(path=>path.map(path => path.key).join('.'));
    const index = textPaths.findIndex(path => path === editorModel.text);
    const path = paths[index];

    if (path) {
      const fullPath = path.map(path => path.key).join('.');

      if(fullPath === editorModel.target.modelBinding.getPath().join('.')){
        return;
      }

      editorModel.target.modelBinding.setModel(path.pop());
      console.log(`Model set to ${fullPath}`);
    }
  });

  const input = ViewFactory.create('text', new ModelBinding(editorModel, 'text'), { name: 'modelEditor' }, {target: document.body});
  ViewFactory.create('label', new ModelBinding(editorModel, 'suggestions', a=>a.join('<br>')), { name: 'modelEditor' }, {target: document.body});

  document.body.addEventListener('click', (event) => {
    let element = findViewInPath(event.path);
    setTarget(element);
  });

  function findViewInPath(path) {
    return path.find(element => element.__boundView !== undefined);
  }

  function setTarget(element) {

    if (element === input.element) {
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
