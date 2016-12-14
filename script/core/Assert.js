function assert(expr, ...message){
  if(!expr){
    console.error(...message);
    throw "Assertion failed";
  }
}