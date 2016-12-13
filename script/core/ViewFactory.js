const defaultViewDefinition = new ViewBindingDefinition();
class ViewFactory {

  constructor(template, viewDefinition=defaultViewDefinition){
    this.template = template;
    this.viewDefinition = viewDefinition;
  }

  create(options={}){
    const properties = options.properties;
    const template = this.template;
    const view = this.viewDefinition.construct({properties, template});
    view.__path = this.__path;

    view.parentView = {view: options.parentView};

    return view;
  }

  static from(template, viewDefinition){
    return new ViewFactory(template, viewDefinition);
  }
}
