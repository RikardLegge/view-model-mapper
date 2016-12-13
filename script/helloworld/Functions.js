Functions.helloworld = {};

Functions.helloworld.invert = b=>!b;
Functions.helloworld.wrapLines = a=>a.join('<br>');

Functions.helloworld.disableIfNull = (view, model, key)=> model[key] !== null ? view.enable() : view.disable();
Functions.helloworld.disableIfModelTextNull = (view, model)=>Functions.helloworld.disableIfNull(view, model, 'modelText');
Functions.helloworld.disableIfEventTextNull = (view, model)=>Functions.helloworld.disableIfNull(view, model, 'eventText');

Functions.helloworld.rewriteNullEventText = value=>
  value !== null ? value : `[EventBinding UNAVAILABLE]`;
Functions.helloworld.rewriteNullModelText = value=>
  value !== null ? value : `[ModelBinding UNAVAILABLE]`;

Functions.helloworld.setText1 = (key, model)=>model['pressed'] = 'Example text';