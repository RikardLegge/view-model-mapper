class ModuleParser {

  static add(name, parser) {
    this.parsers.push({name, parser});
  }

  parse(obj, modules) {
    const parsedData = {};
    const unresolvedData = [];

    const extra = {parsed: parsedData, unresolved: unresolvedData, modules};

    const parsers = ModuleParser.parsers.slice(0);
    let lastParsedDefinition = 0;
    while(parsers.length > 0 ){
      const parserDef = parsers.shift();
      const {name, parser} = parserDef;

      const parsed = parser(obj, extra);

      assert(lastParsedDefinition < 100, `Unable to resolve the rest of the parsers. Stuck in infinite loop`, parserDef, parsers);

      if(parsed === false){
        lastParsedDefinition++;
        parsers.push(parserDef);
      } else {
        lastParsedDefinition = 0;

        if(parsed) {
          const {data, unresolved} = parsed;
          Object.assign(unresolvedData, unresolved);
          parsedData[name] = data;
        }
      }
    }

    return parsedData;
  }

  static reducePath(obj, path) {
    const leaf = path.reduce((obj, path) => obj && obj[path], obj);

    console.assert(leaf, `Unable to expand path to a value for`, path, obj);

    return leaf;
  }

}
ModuleParser.parsers = [];
