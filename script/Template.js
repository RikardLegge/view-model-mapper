class Template {

  constructor(templateProperties, templateString){
    this.templateProperties = templateProperties;
    this.templateString = templateString;
  }

  construct(properties){
    const templateString = this.compileTemplate(this.templateString, properties);
    const elementConstructor = document.createElement("div");
    elementConstructor.innerHTML = templateString;

    console.assert(elementConstructor.children.length === 1, `Templates with multiple roots are currently not supported`);

    const ports = this.findPorts(elementConstructor);
    const element = elementConstructor.children[0];
    return {element, ports};
  }

  precompileTemplate(templateString, namespace){
    const type = this.templateProperties.name
      ? this.templateProperties.name + '__'
      : '';

    return templateString
      .replace(/class=(['"])([^'"]*)\1/g,
        (_, __, all, key) => all
          .split(' ')
          .filter(cls=>!!cls.trim())
          .map(cls=>`class="${namespace}${type}${cls}"`)
          .join(' '));
  }

  compileTemplate(templateString, properties={}) {
    const namespace = properties.name || '';
    return this.precompileTemplate(templateString, namespace)
      .replace(/(#\{([^}]*)})/g,
        (_, all, key) => properties[key] || '' )
  }

  findPorts(element){
    const self = element.hasAttribute('data-port') ? [element] : [];
    return [...self, ...element.querySelectorAll('[data-port]')];
  }

}