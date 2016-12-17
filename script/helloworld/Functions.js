const helloworldF = new Registry('helloworld', Functions);

helloworldF.register('invert', b => !b);
helloworldF.register('wrapLines', a => a.join('<br>'));

helloworldF.register('disableIfNull', (view, model, {target}) =>
  model[target] !== null ? view.enable() : view.disable());

helloworldF.register('hideIfNull', (view, model, {target}) =>
  model[target] !== null ? view.show() : view.hide());

helloworldF.register('positionAtTargetView', (view, model, {target}) =>{
  const targetView = model[target];

  if(targetView) {
    const element = targetView.element;

    if(element){
      view.show();
      const viewRect = view.element.getBoundingClientRect();
      let center;

      if(isDescendant(view.element, element)) {
        console.log('inside') ;
        const bodyRect = document.body.getBoundingClientRect();
        center = {x: bodyRect.width/2, y: bodyRect.height/2};

        center.y -= viewRect.height/2;
        center.x -= viewRect.width/2;
      } else {
        const targetRect = element.getBoundingClientRect();
        center = {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2
        };

        center.y += targetRect.height / 2 + 20;
        center.x -= viewRect.width / 2;
      }

      if(center.x < 20)
        center.x = 20;

      view.setPosition(center);
      return;
    }
  }

  view.setPosition({x: 0, y: 0});
  view.hide();
});

helloworldF.register('rewriteNull', (value, properties) =>
  value !== null ? value : properties['default']);

function isDescendant(parent, child) {
  while (child != null) {
    if (child == parent) {
      return true;
    }
    child = child.parentNode;
  }
  return false;
}