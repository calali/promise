function Promise1(executor){
    let self = this;
    self.status = 'pending'; 
    self.value = undefined;
    self.reason = undefined;

    function resolve(value){
        if( self.status === 'pending'){
            self.status = 'fulfilled';
            self.value = value;
        }
    }
    function reject(reason){
        if( self.status === 'pending'){
            self.status = 'rejected';
            self.reason = reason;
        }
    }
    
    executor(resolve,reject);
}
Promise1.prototype.then = function(onFulfilled,onRejected){
    let self = this;
    if(self.status === 'fulfilled'){
        onFulfilled(self.value);
    }
    if(self.status === 'rejected'){
        onRejected(self.reason);
    }
}


let promise = new Promise1(function(resolve,reject){
    resolve(123)
})
promise.then(function(data){
    console.log(data);
},function(err){
    console.log(err);
})
