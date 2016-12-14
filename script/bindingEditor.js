function bindingEditor(module) {
  const editorModel = module.models.findByTag('editor');

  editorModel.listen('target', () => {
    const target = editorModel.target;
    if (target) {
      applyTargetStyle();

      const modelBinding = target.modelBinding;
      const eventBinding = target.eventBinding;

      editorModel.viewProperties = `id: ` + module.views.getMeta(target).id;
      editorModel.eventText = eventBinding ? getPathName(eventBinding) : null;
      editorModel.modelText = modelBinding ? getPathName(modelBinding) : null;
      editorModel.templateText = target.templateProperties.name;
    } else {
      editorModel.eventText = null;
      editorModel.modelText = null;
      editorModel.templateText = null;
    }

    function getPathName(binding) {
      const tagName = module.models.getMeta(binding.model).tag;
      const property = binding.path[binding.path.length - 1];

      return `${tagName}.${property}`;
    }
  });
  editorModel.listen('modelText', updateModelBinding);
  editorModel.listen('eventText', updateEventBinding);
  editorModel.listen('templateText', updateTemplate);

  function updateTemplate() {
    const target = editorModel.target;
    if (target && target.templateProperties.name !== editorModel.templateText) {
      target.templateProperties.name = editorModel.templateText;
      target.redrawElement();
      applyTargetStyle();
    }
  }

  function updateEventBinding() {
    if (!editorModel.target || !editorModel.target.eventBinding) {
      return;
    }
    editorModel.target.eventBinding.signal = editorModel.eventText;
  }

  function updateModelBinding() {
    if (!editorModel.target || !editorModel.target.modelBinding) {
      editorModel.suggestions = [];
      return;
    }
    const targetPath = editorModel.modelText;

    const modelSuggestions = module.models.models.reduce((suggestions, model) => {
      const properties = ReflectModel.getPaths(model.model, false);
      const fullProperties = properties.map(property => ({
        model: model.model, key: property.key, property, value: property.model[property.key],
        pathName: `${model.tag}.${property.key}`
      }));
      suggestions.push(...fullProperties);
      return suggestions;
    }, []);

    const suggestions = modelSuggestions
      .filter(path => path.pathName.indexOf(targetPath) === 0);

    editorModel.suggestions = suggestions
      .map(path => `<b>${path.pathName}</b> => ${path.value}`);

    const path = suggestions.length === 1
      ? suggestions[0]
      : null;

    if (path) {
      const fullPath = path.pathName;
      const binding = editorModel.target.modelBinding;
      const editorModelPath = module.models.getMeta(binding.model).tag + `.` + binding.path.pop();

      if (fullPath === editorModelPath) {
        return;
      }

      editorModel.target.modelBinding.properties = {model: path.model, key: path.key};
      console.log(`Model set to ${fullPath} from ${editorModelPath}`);
      setTimeout(() => editorModel.modelText = fullPath, 0);
    }
  }

  document.body.addEventListener('mousemove', (event) => {
    if (event.shiftKey) {
      const {pageX: x, pageY: y} = event;
      const element = document.elementFromPoint(x, y);
      const view = findViewForElement(element);
      setTarget(view);
    }
  });

  function findViewForElement(element) {
    while (element) {
      const view = element.boundView;
      if (view) {
        return element;
      }
      element = element.parentNode;
    }
  }

  function applyTargetStyle() {
    editorModel.target.element.style = 'border: 4px solid orange';
  }

  function setTarget(element) {

    if (editorModel.target) {
      const targetElement = editorModel.target.element;
      if (element === targetElement)
        return;
      editorModel.target.element.style = '';
    }

    if (element && element !== document.body) {
      editorModel.target = element.boundView;
    } else {
      editorModel.target = null;
    }
  }

}