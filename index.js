var a = new Promise(function(resolve){
  setTimeout(function(){
    resolve('ok')
  },0)
})
a.then(function(data){
  console.log(1)
})

a.then(function(data){
  console.log(2)
})