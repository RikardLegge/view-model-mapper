const Functions = new Registry();

const typeF = new Registry('type', Functions);

typeF.register('boolean', (v) => !!v);
typeF.register('number', (v) => Number(v));
typeF.register('integer', (v) => parseInt(v));

const defaultF = new Registry('default', Functions);

defaultF.register('triggerEvent', (model, {target}) => model.trigger(target));
