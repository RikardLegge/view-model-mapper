const helloworldF = new Registry('helloworld', Functions);

helloworldF.register('invert', b => !b);
helloworldF.register('wrapLines', a => a.join('<br>'));

helloworldF.register('disableIfNull', (view, model, {target}) =>
  model[target] !== null ? view.enable() : view.disable());

helloworldF.register('hideIfNull', (view, model, {target}) =>
  model[target] !== null ? view.show() : view.hide());

helloworldF.register('rewriteNull', (value, properties) =>
  value !== null ? value : properties['default']);
