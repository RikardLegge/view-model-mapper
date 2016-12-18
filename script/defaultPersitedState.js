/*
const defaultEditorState = {
  header: {
    id: 8884463459267604,
    idCounter: 100
  },
  models: [
    {
      id: 3,
      name: 'editor',
      properties: {
        lastSaved: 0,
        viewProperties: '',
        eventModelIdText: '',
        templateText: '',
        modelText: '',
        viewText: '',
        eventText: '',
        target: null,
        moveTarget: null,
        suggestions: []
      },
      derivedProperties: {
        viewProperties: {path: ['module', '8884463459267604', 'viewProperties'], dependencies: ['target']}
      }
    },
    {
      id: 4,
      name: 'text',
      properties: {
        save: 'Save',
        load: 'Load',
        clear: 'Clear',
        move: 'Move',
        lastSaved: 'Last Save: ',
        create: 'Create view',
        delete: 'Delete',
        type: 'Type',
        model: 'ModelDefinition',
        property: 'Property',
      }
    },
    {
      id: 5,
      name: 'viewCreator',
      properties: {
        type: 'checkbox',
        modelTag: "editor",
        modelKey: "valid",
        name: "default",
      },
      aliases: [
        {key: 'editor', value: {type:'model', id: 3}}
      ]
    }
  ],
  views: [
    {id: 11, index: 0, path: ['default', 'root'], properties: {selector: '#editor'}},

    {id: 28, index: 2, path: ['default', 'group'], parentView: {id: 11, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 60, index: 3, path: ['default', 'group'], parentView: {id: 11, port: 0}},

    {id: 32, index: 0, path: ['default', 'button'], parentView: {id: 60, port: 0}},
    {id: 33, index: 0, path: ['default', 'label'], parentView: {id: 32, port: 0}},

    {id: 34, index: 1, path: ['default', 'button'], parentView: {id: 60, port: 0}},
    {id: 35, index: 0, path: ['default', 'label'], parentView: {id: 34, port: 0}},

    {id: 36, index: 2, path: ['default', 'button'], parentView: {id: 60, port: 0}},
    {id: 37, index: 0, path: ['default', 'label'], parentView: {id: 36, port: 0}},

    {id: 29, index: 10, path: ['default', 'label'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 30, index: 5, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 31, index: 7, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 50, index: 6, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 56, index: 9, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 48, index: 11, path: ['default', 'label'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},
    {id: 49, index: 8, path: ['default', 'text'], parentView: {id: 28, port: 0}, properties: {name: 'bindingEditor'}},

    {id: 14, index: 3, path: ['default', 'group'], parentView: {id: 11, port: 0}, properties: {name: ''}},

    {id: 67, index: 3, path: ['default', 'group'], parentView: {id: 14, port: 0}},

    {id: 61, index: 3, path: ['default', 'group'], parentView: {id: 67, port: 0}},
    {id: 64, index: 0, path: ['default', 'label'], parentView: {id: 61, port: 0}},
    {id: 40, index: 1, path: ['default', 'text'], parentView: {id: 61, port: 0}, properties: {name: ''}},

    {id: 62, index: 4, path: ['default', 'group'], parentView: {id: 67, port: 0}},
    {id: 65, index: 0, path: ['default', 'label'], parentView: {id: 62, port: 0}},
    {id: 42, index: 1, path: ['default', 'text'], parentView: {id: 62, port: 0}, properties: {name: ''}},

    {id: 63, index: 5, path: ['default', 'group'], parentView: {id: 67, port: 0}},
    {id: 66, index: 0, path: ['default', 'label'], parentView: {id: 63, port: 0}},
    {id: 43, index: 1, path: ['default', 'text'], parentView: {id: 63, port: 0}, properties: {name: ''}},

    {id: 68, index: 3, path: ['default', 'group'], parentView: {id: 67, port: 0}},

    {id: 44, index: 4, path: ['default', 'button'], parentView: {id: 68, port: 0}},
    {id: 45, index: 0, path: ['default', 'label'], parentView: {id: 44, port: 0}},

    {id: 46, index: 5, path: ['default', 'button'], parentView: {id: 68, port: 0}},
    {id: 47, index: 0, path: ['default', 'label'], parentView: {id: 46, port: 0}},

    {id: 53, index: 3, path: ['default', 'group'], parentView: {id: 11, port: 0}},
    {id: 54, index: 0, path: ['default', 'label'], parentView: {id: 53, port: 0}},
    {id: 55, index: 1, path: ['default', 'label'], parentView: {id: 53, port: 0}},
  ],

  middleware: [
    {id: 1, path: ['helloworld', 'none']},
    {id: 2, path: ['helloworld', 'wrapLines'], properties: {deliminer: '<br>'}},
    {id: 3, path: ['helloworld', 'rewriteNull'], properties: {placeholder: '[NULL]'}},
  ],

  viewMutators: [
    {view: {id: 30}, mutator: {path: ['helloworld', 'disableIfNull'], properties: {target: 'modelText'}}},
    {view: {id: 31}, mutator: {path: ['helloworld', 'disableIfNull'], properties: {target: 'eventText'}}},
    {view: {id: 50}, mutator: {path: ['helloworld', 'disableIfNull'], properties: {target: 'eventModelIdText'}}},
    {view: {id: 28}, mutator: {path: ['helloworld', 'positionAtTargetView'], properties: {target: 'target'}}},
  ],

  modelBindings: [
    {view: {id: 33}, model: {id: 4, path: 'save'}},
    {view: {id: 35}, model: {id: 4, path: 'load'}},
    {view: {id: 37}, model: {id: 4, path: 'clear'}},
    {view: {id: 47}, model: {id: 4, path: 'delete'}},
    {view: {id: 29}, model: {id: 3, path: 'suggestions'}, middleware: {get: {id: 2}}},

    {view: {id: 30}, model: {id: 3, path: 'modelText'}, middleware: {get: {id: 3, properties: {placeholder: '[ModelBinding UNAVAILABLE]'}}}},
    {view: {id: 31}, model: {id: 3, path: 'eventText'}, middleware: {get: {id: 3, properties: {placeholder: '[EventBinding UNAVAILABLE]'}}}},
    {view: {id: 50}, model: {id: 3, path: 'eventModelIdText'}, middleware: {get: {id: 3, properties: {placeholder: '[EventModelID UNAVAILABLE]'}}}},

    {view: {id: 48}, model: {id: 3, path: 'templateText'}},

    {view: {id: 40}, model: {id: 5, path: 'type'}},
    {view: {id: 42}, model: {id: 5, path: 'modelTag'}},
    {view: {id: 43}, model: {id: 5, path: 'modelKey'}},
    {view: {id: 45}, model: {id: 4, path: 'create'}},
    {view: {id: 48}, model: {id: 3, path: 'viewProperties'}},
    {view: {id: 49}, model: {id: 3, path: 'templateText'}},

    {view: {id: 28}, model: {id: 3, path: 'target'}},

    {view: {id: 54}, model: {id: 4, path: 'lastSaved'}},
    {view: {id: 55}, model: {id: 3, path: 'lastSaved'}},

    {view: {id: 64}, model: {id: 4, path: 'type'}},
    {view: {id: 65}, model: {id: 4, path: 'model'}},
    {view: {id: 66}, model: {id: 4, path: 'property'}},
  ],

  eventBindings: [
    {view: {id: 32}, model: {id: 3}, signalHandler: {path: ['application', 'saveState']}},
    {view: {id: 34}, model: {id: 3}, signalHandler: {path: ['application', 'loadState']}},
    {view: {id: 36}, model: {id: 3}, signalHandler: {path: ['application', 'clearState']}},
    {view: {id: 44}, model: {id: 5}, signalHandler: {path: ['application', 'addView']}},
    {view: {id: 46}, model: {id: 3}, signalHandler: {path: ['application', 'removeView']}},

    {view: {id: 30}, model: {id: 3}, signalHandler: {path: ['default', 'triggerEvent'], properties: {target: 'applyModelText'}}},
    {view: {id: 31}, model: {id: 3}, signalHandler: {path: ['default', 'triggerEvent'], properties: {target: 'applyEventText'}}},
    {view: {id: 50}, model: {id: 3}, signalHandler: {path: ['default', 'triggerEvent'], properties: {target: 'applyEventModelIdText'}}},
  ]
};
*/

const defaultEditorState = JSON.parse('{"header":{"id":8884463459267604,"idCounter":114},"models":[{"id":3,"name":"editor","properties":{"lastSaved":1482099511457,"viewProperties":null,"eventModelIdText":null,"templateText":null,"modelText":null,"viewText":"","eventText":null,"moveTarget":null,"suggestions":[],"target":null},"aliases":[],"middleware":[]},{"id":4,"name":"text","properties":{"save":"Save","load":"Load","clear":"Clear","move":"Move","lastSaved":"Last Save: ","create":"Create view","delete":"Delete","type":"Type","model":"ModelDefinition","property":"Property"},"aliases":[],"middleware":[]},{"id":5,"name":"viewCreator","properties":{"type":"group","modelTag":"","modelKey":"","name":"default"},"aliases":[{"key":"editor","value":{"type":"model","id":3}}],"middleware":[]}],"views":[{"id":11,"index":0,"path":["default","root"],"properties":{"selector":"#editor","name":"default"}},{"id":14,"index":1,"path":["default","group"],"parentView":{"id":11,"port":0},"properties":{"name":""}},{"id":28,"index":0,"path":["default","group"],"parentView":{"id":11,"port":0},"properties":{"name":"bindingEditor"}},{"id":29,"index":0,"path":["default","label"],"parentView":{"id":114,"port":0},"properties":{"name":"bindingEditorSuggestions"}},{"id":30,"index":0,"path":["default","text"],"parentView":{"id":103,"port":0},"properties":{"name":"bindingEditor"}},{"id":31,"index":1,"path":["default","text"],"parentView":{"id":102,"port":0},"properties":{"name":"bindingEditor"}},{"id":32,"index":2,"path":["default","button"],"parentView":{"id":113,"port":0},"properties":{"name":"savebar"}},{"id":33,"index":0,"path":["default","label"],"parentView":{"id":32,"port":0},"properties":{"name":"default"}},{"id":34,"index":1,"path":["default","button"],"parentView":{"id":113,"port":0},"properties":{"name":"savebar"}},{"id":35,"index":0,"path":["default","label"],"parentView":{"id":34,"port":0},"properties":{"name":"default"}},{"id":36,"index":0,"path":["default","button"],"parentView":{"id":113,"port":0},"properties":{"name":"savebar"}},{"id":37,"index":0,"path":["default","label"],"parentView":{"id":36,"port":0},"properties":{"name":"default"}},{"id":40,"index":1,"path":["default","text"],"parentView":{"id":61,"port":0},"properties":{"name":""}},{"id":42,"index":1,"path":["default","text"],"parentView":{"id":62,"port":0},"properties":{"name":""}},{"id":43,"index":1,"path":["default","text"],"parentView":{"id":63,"port":0},"properties":{"name":""}},{"id":44,"index":0,"path":["default","button"],"parentView":{"id":68,"port":0},"properties":{"name":"default"}},{"id":45,"index":0,"path":["default","label"],"parentView":{"id":44,"port":0},"properties":{"name":"default"}},{"id":46,"index":3,"path":["default","button"],"parentView":{"id":28,"port":0},"properties":{"name":"default"}},{"id":47,"index":0,"path":["default","label"],"parentView":{"id":46,"port":0},"properties":{"name":"default"}},{"id":48,"index":0,"path":["default","label"],"parentView":{"id":28,"port":0},"properties":{"name":"bindingEditor"}},{"id":49,"index":0,"path":["default","text"],"parentView":{"id":104,"port":0},"properties":{"name":"bindingEditor"}},{"id":50,"index":0,"path":["default","text"],"parentView":{"id":102,"port":0},"properties":{"name":"bindingEditor"}},{"id":53,"index":0,"path":["default","group"],"parentView":{"id":60,"port":0},"properties":{"name":"lastSaved"}},{"id":54,"index":0,"path":["default","label"],"parentView":{"id":53,"port":0},"properties":{"name":"default"}},{"id":55,"index":1,"path":["default","label"],"parentView":{"id":53,"port":0},"properties":{"name":"default"}},{"id":56,"index":0,"path":["default","text"],"parentView":{"id":105,"port":0},"properties":{"name":"bindingEditor"}},{"id":60,"index":2,"path":["default","group"],"parentView":{"id":11,"port":0},"properties":{"name":"savebar"}},{"id":61,"index":1,"path":["default","group"],"parentView":{"id":67,"port":0},"properties":{"name":"default"}},{"id":62,"index":2,"path":["default","group"],"parentView":{"id":67,"port":0},"properties":{"name":"default"}},{"id":63,"index":3,"path":["default","group"],"parentView":{"id":67,"port":0},"properties":{"name":"default"}},{"id":64,"index":0,"path":["default","label"],"parentView":{"id":61,"port":0},"properties":{"name":"default"}},{"id":65,"index":0,"path":["default","label"],"parentView":{"id":62,"port":0},"properties":{"name":"default"}},{"id":66,"index":0,"path":["default","label"],"parentView":{"id":63,"port":0},"properties":{"name":"default"}},{"id":67,"index":4,"path":["default","group"],"parentView":{"id":28,"port":0},"properties":{"name":"default"}},{"id":68,"index":0,"path":["default","group"],"parentView":{"id":67,"port":0},"properties":{"name":"default"}},{"id":101,"index":1,"path":["default","group"],"parentView":{"id":28,"port":0},"properties":{"name":"default"}},{"id":102,"index":0,"path":["default","group"],"parentView":{"id":101,"port":0},"properties":{"name":"default"}},{"id":103,"index":1,"path":["default","group"],"parentView":{"id":101,"port":0},"properties":{"name":"default"}},{"id":104,"index":2,"path":["default","group"],"parentView":{"id":101,"port":0},"properties":{"name":"default"}},{"id":105,"index":3,"path":["default","group"],"parentView":{"id":101,"port":0},"properties":{"name":"default"}},{"id":113,"index":1,"path":["default","group"],"parentView":{"id":60,"port":0},"properties":{"name":"saveBarButtons"}},{"id":114,"index":2,"path":["default","group"],"parentView":{"id":28,"port":0},"properties":{"name":"bindingEditorSuggestions"}}],"middleware":[{"id":1,"path":["helloworld","none"]},{"id":2,"path":["helloworld","wrapLines"],"properties":{"deliminer":"<br>"}},{"id":3,"path":["helloworld","rewriteNull"],"properties":{"placeholder":"[NULL]"}}],"modelBindings":[{"view":{"id":28},"model":{"id":3,"path":"target"}},{"view":{"id":29},"model":{"id":3,"path":"suggestions"},"middleware":{"get":{"id":2}}},{"view":{"id":30},"model":{"id":3,"path":"modelText"},"middleware":{"get":{"id":3,"properties":{"placeholder":"[ModelBinding UNAVAILABLE]"}}}},{"view":{"id":31},"model":{"id":3,"path":"eventText"},"middleware":{"get":{"id":3,"properties":{"placeholder":"[EventBinding UNAVAILABLE]"}}}},{"view":{"id":33},"model":{"id":4,"path":"save"}},{"view":{"id":35},"model":{"id":4,"path":"load"}},{"view":{"id":37},"model":{"id":4,"path":"clear"}},{"view":{"id":40},"model":{"id":5,"path":"type"}},{"view":{"id":42},"model":{"id":5,"path":"modelTag"}},{"view":{"id":43},"model":{"id":5,"path":"modelKey"}},{"view":{"id":45},"model":{"id":4,"path":"create"}},{"view":{"id":47},"model":{"id":4,"path":"delete"}},{"view":{"id":48},"model":{"id":3,"path":"viewProperties"}},{"view":{"id":49},"model":{"id":3,"path":"templateText"}},{"view":{"id":50},"model":{"id":3,"path":"eventModelIdText"},"middleware":{"get":{"id":3,"properties":{"placeholder":"[EventModelID UNAVAILABLE]"}}}},{"view":{"id":54},"model":{"id":4,"path":"lastSaved"}},{"view":{"id":55},"model":{"id":3,"path":"lastSaved"}},{"view":{"id":64},"model":{"id":4,"path":"type"}},{"view":{"id":65},"model":{"id":4,"path":"model"}},{"view":{"id":66},"model":{"id":4,"path":"property"}}],"eventBindings":[{"view":{"id":30},"model":{"id":3},"signalHandler":{"path":["default","triggerEvent"],"properties":{"target":"applyModelText"}}},{"view":{"id":31},"model":{"id":3},"signalHandler":{"path":["default","triggerEvent"],"properties":{"target":"applyEventText"}}},{"view":{"id":32},"model":{"id":3},"signalHandler":{"path":["application","saveState"]}},{"view":{"id":34},"model":{"id":3},"signalHandler":{"path":["application","loadState"]}},{"view":{"id":36},"model":{"id":3},"signalHandler":{"path":["application","clearState"]}},{"view":{"id":44},"model":{"id":5},"signalHandler":{"path":["application","addView"]}},{"view":{"id":46},"model":{"id":3},"signalHandler":{"path":["application","removeView"]}},{"view":{"id":50},"model":{"id":3},"signalHandler":{"path":["default","triggerEvent"],"properties":{"target":"applyEventModelIdText"}}}],"viewMutators":[{"view":{"id":28},"mutator":{"path":["helloworld","positionAtTargetView"],"properties":{"target":"target"}}},{"view":{"id":30},"mutator":{"path":["helloworld","disableIfNull"],"properties":{"target":"modelText"}}},{"view":{"id":31},"mutator":{"path":["helloworld","disableIfNull"],"properties":{"target":"eventText"}}},{"view":{"id":50},"mutator":{"path":["helloworld","disableIfNull"],"properties":{"target":"eventModelIdText"}}}]}');

const defaultExamplePersistedState = {
  header: {
    id: 1138653602534978,
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
    }
  ],
  views: [
    {id: 10, index: 0, path: ['default', 'root'], properties: {selector: '#example'}},

    {id: 11, index: 1, path: ['default', 'group'], parentView: {id: 10, port: 0}, properties: {name: 'log'}},
    {id: 12, index: 0, path: ['default', 'label'], parentView: {id: 11, port: 0}, properties: {name: 'callstack'}},
  ],

  viewMutators: [

  ],

  modelBindings: [
    {view: {id: 12}, model: {id: 1, path: 'log'}, middleware: {path: ['helloworld', 'wrapLines']}},
  ],

  eventBindings: [

  ]
};
