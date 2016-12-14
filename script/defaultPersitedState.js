const defaultPersistedState = {
  header: {
    idCounter: 50
  },
  models: [
    {
      id: 1,
      name: 'application',
      properties: {
        frameCount: 0,
        counter: 1,
        log: []
      },
      aliases: [
        {key: 'button', value: {type: 'model', id: 2}}
      ]
    },
    {
      id: 2,
      name: 'button',
      properties: {
        pressed: false,
        valid: true,
        invalid: false,
        exampleText: 'Press me! Then change "button.exampleText" to "frameCount"'
      },
      middleware: [
        {key: 'pressed', middleware: {path: ['type', 'boolean']}},
        {key: 'valid', middleware: {path: ['type', 'boolean']}},
        {key: 'invalid', middleware: {path: ['type', 'boolean']}},
      ]
    },
    {
      id: 3,
      name: 'editor',
      properties: {
        viewProperties: '',
        templateText: '',
        modelText: '',
        viewText: '',
        eventText: '',
        target: null,
        suggestions: []
      }
    },
    {
      id: 4,
      name: 'text',
      properties: {
        save: 'Save',
        load: 'Load',
        clear: 'Clear',
        create: 'Create view',
        delete: 'Delete'
      }
    },
    {
      id: 5,
      name: 'viewCreator',
      properties: {
        type: 'checkbox',
        parentId: 12,
        modelId: 2,
        modelKey: "valid",
        name: "default",
      }
    }
  ],
  views: [
    {id: 11, index: 0, path: ['default', 'root']},

    {id: 13, index: 1, path: ['default', 'group'], parentView: {id: 11, port: 0}, properties: {name: 'log'}},
    {id: 26, index: 0, path: ['default', 'label'], parentView: {id: 13, port: 0}, properties: {name: 'callstack'}},

    {id: 28, index: 2, path: ['default', 'group'], parentView: {id: 11, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 32, index: 0, path: ['default', 'button'], parentView: {id: 28, port: 0}},
    {id: 33, index: 0, path: ['default', 'label'], parentView: {id: 32, port: 0}},

    {id: 34, index: 1, path: ['default', 'button'], parentView: {id: 28, port: 0}},
    {id: 35, index: 0, path: ['default', 'label'], parentView: {id: 34, port: 0}},

    {id: 36, index: 2, path: ['default', 'button'], parentView: {id: 28, port: 0}},
    {id: 37, index: 0, path: ['default', 'label'], parentView: {id: 36, port: 0}},

    {id: 29, index: 3, path: ['default', 'label'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 30, index: 5, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 31, index: 6, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 48, index: 4, path: ['default', 'label'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 49, index: 7, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 14, index: 3, path: ['default', 'group'], parentView: {id: 11, port: 0}, properties: {name: ''}},
    {id: 40, index: 0, path: ['default', 'text'], parentView: {id: 14, port: 0}, properties: {name: ''}},
    {id: 41, index: 1, path: ['default', 'text'], parentView: {id: 14, port: 0}, properties: {name: ''}},
    {id: 42, index: 2, path: ['default', 'text'], parentView: {id: 14, port: 0}, properties: {name: ''}},
    {id: 43, index: 3, path: ['default', 'text'], parentView: {id: 14, port: 0}, properties: {name: ''}},
    {id: 44, index: 4, path: ['default', 'button'], parentView: {id: 14, port: 0}},
    {id: 45, index: 0, path: ['default', 'label'], parentView: {id: 44, port: 0}},
    {id: 46, index: 5, path: ['default', 'button'], parentView: {id: 14, port: 0}},
    {id: 47, index: 0, path: ['default', 'label'], parentView: {id: 46, port: 0}},
  ],

  viewMutators: [
    {view: {id: 30}, mutator: {path: ['helloworld', 'disableIfModelTextNull']}},
    {view: {id: 31}, mutator: {path: ['helloworld', 'disableIfEventTextNull']}},
  ],

  modelBindings: [
    {view: {id: 26}, model: {id: 1, path: 'log'}, middlewere: {path: ['helloworld', 'wrapLines']}},
    {view: {id: 33}, model: {id: 4, path: 'save'}},
    {view: {id: 35}, model: {id: 4, path: 'load'}},
    {view: {id: 37}, model: {id: 4, path: 'clear'}},
    {view: {id: 47}, model: {id: 4, path: 'delete'}},
    {view: {id: 29}, model: {id: 3, path: 'suggestions'}, middlewere: {path: ['helloworld', 'wrapLines']}},
    {view: {id: 30}, model: {id: 3, path: 'modelText'}, middlewere: {path: ['helloworld', 'rewriteNullModelText']}},
    {view: {id: 31}, model: {id: 3, path: 'eventText'}, middlewere: {path: ['helloworld', 'rewriteNullEventText']}},
    {view: {id: 48}, model: {id: 3, path: 'templateText'}},

    {view: {id: 40}, model: {id: 5, path: 'type'}},
    {view: {id: 41}, model: {id: 5, path: 'parentId'}},
    {view: {id: 42}, model: {id: 5, path: 'modelId'}},
    {view: {id: 43}, model: {id: 5, path: 'modelKey'}},
    {view: {id: 44}, model: {id: 5, path: 'name'}},
    {view: {id: 45}, model: {id: 4, path: 'create'}},
    {view: {id: 48}, model: {id: 3, path: 'viewProperties'}},
    {view: {id: 49}, model: {id: 3, path: 'templateText'}},
  ],

  eventBindings: [
    {view: {id: 32}, model: {id: 2}, signal: 'signal1', signalHandler: {path: ['application', 'saveState']}},
    {view: {id: 34}, model: {id: 2}, signal: 'signal1', signalHandler: {path: ['application', 'loadState']}},
    {view: {id: 36}, model: {id: 2}, signal: 'signal1', signalHandler: {path: ['application', 'clearState']}},
    {view: {id: 44}, model: {id: 5}, signal: 'signal1', signalHandler: {path: ['application', 'addView']}},
    {view: {id: 46}, model: {id: 3}, signal: 'signal1', signalHandler: {path: ['application', 'removeView']}},
  ]
};