const defaultF = new Registry('default', Functions);

defaultF.register('triggerEvent', (model, {target}) => model.trigger(target));