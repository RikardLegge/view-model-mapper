const typeF = new Registry('type', Functions);

typeF.register('boolean', (v) => !!v);
typeF.register('number', (v) => Number(v));
typeF.register('integer', (v) => parseInt(v));