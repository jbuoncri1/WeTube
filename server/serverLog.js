var log = function(){
  if(arguments.length > 1){
    var argumentsArray = []
    for(var keys in arguments){
      argumentsArray[keys] = arguments[keys]
    }
    console.log(argumentsArray)
    
  } else {
    console.log(arguments[0])
  }
}

var errorMessages = {
  reqNotFound: "request not found"
}


module.exports = {
  log: log,
  errorMessages: errorMessages
}