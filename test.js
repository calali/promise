function getUserId() {
    return new Promise1(function(resolve) {
        setTimeout(function(){
            resolve('ok')
        },0)
        
    })
}

getUserId().then(function(id) {
    //一些处理
    console.log(123,id);
    
})

function Promise1(fn) {
    var value = null,
        callbacks = [];  //callbacks为数组，因为可能同时有很多个回调
    this.then = function (onFulfilled) {
        callbacks.push(onFulfilled);
    };
    function resolve(value) {
        callbacks.forEach(function (callback) {
            callback(value);
        });
    }
    fn(resolve);
}