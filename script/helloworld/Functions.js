const helloworldF = new Registry('helloworld', Functions);

helloworldF.register('invert', b => !b);

helloworldF.register('invert', b => !b);
helloworldF.register('wrapLines', a => a.join('<br>'));

helloworldF.register('disableIfNull', (view, model, key) => model[key] !== null ? view.enable() : view.disable());
helloworldF.register('disableIfModelTextNull', (view, model) => Functions.helloworld.disableIfNull(view, model, 'modelText'));
helloworldF.register('disableIfEventTextNull', (view, model) => Functions.helloworld.disableIfNull(view, model, 'eventText'));

helloworldF.register('rewriteNullEventText', value =>
  value !== null ? value : `[EventBinding UNAVAILABLE]`);
helloworldF.register('rewriteNullModelText', value =>
  value !== null ? value : `[ModelBinding UNAVAILABLE]`);

helloworldF.register('setText1', (key, model) => model['pressed'] = 'Example text');