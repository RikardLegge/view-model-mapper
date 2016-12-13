const noOp = ()=>{};
const notYetImplemented = ()=>{throw "Not yet implemented"};

class ViewBindingDefinition {

  constructor(viewDefinition = {}){
    this.viewDefinition = viewDefinition;
  }

  construct(viewProperties){
    const vd = this.viewDefinition;
    const view = new ViewBinding(viewProperties);

    view.construct = vd.construct || noOp;
    view.getValue = vd.get || noOp;
    view.setValue = vd.set || noOp;
    view.attachElement = vd.attach || noOp;
    view.detachElement = vd.detach || noOp;
    view.enable = vd.setProp ? ()=>vd.setProp(view, 'disabled', false) : notYetImplemented;
    view.disable = vd.setProp ? ()=>vd.setProp(view, 'disabled', true) : notYetImplemented;

    view.construct(view);
    view.redrawElement();

    return view;
  }
}