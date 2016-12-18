const helloworldF = new Registry('helloworld', Functions);

helloworldF.register('invert', b => !b);
helloworldF.register('none', b => b);
helloworldF.register('wrapLines', a => a.join('<br>'));

helloworldF.register('disableIfNull', (view, model, {target}) =>
  model[target] !== null ? view.enable() : view.disable());

helloworldF.register('hideIfNull', (view, model, {target}) =>
  model[target] !== null ? view.show() : view.hide());

helloworldF.register('positionAtTargetView', (view, model, {target}) =>{
  const targetView = model[target];
  view.setPosition({x: 0, y: 0});

  if(targetView) {
    const element = targetView.element;

    if(element){
      view.show();
      const viewRect = view.element.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      let center;

      if(targetView.isDescendantOf(view)) {
        center = {x: bodyRect.width/2, y: bodyRect.height/2};

        center.y = 0;
        center.x -= viewRect.width/2;
      } else {
        const targetRect = element.getBoundingClientRect();
        center = {
          x: null,
          y: null
        };

        if(targetRect.y < bodyRect.height/2) {
          center.y = targetRect.top + targetRect.height + 20;
        } else {
          center.y = targetRect.top - viewRect.height - 20;

        }
        center.x = targetRect.left + targetRect.width / 2 - viewRect.width / 2;

        if(center.x < 20)
          center.x = 20;

        if(center.x + viewRect.width + 20 > bodyRect.width)
          center.x = bodyRect.width - 20 - viewRect.width;

        if(center.y < 20)
          center.y = 20;

        if(center.y + viewRect.height + 20 > bodyRect.height)
          center.y = bodyRect.height - 20 - viewRect.height;
      }


      view.setPosition(center);
      return;
    }
  }

  view.hide();
});

helloworldF.register('rewriteNull', (value, properties) =>
  value !== null ? value : properties['placeholder']);

