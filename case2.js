function Promise(executor){ 
    let self = this;
    self.status = 'pending'; 
    self.value = undefined;
    self.reason = undefined;
    self.onResolvedCallbacks = [];
    self.onRejectedCallbacks = [];
    
    function resolve(value){
        if( self.status === 'pending'){
            self.status = 'fulfilled'; 
            self.value = value; 
            self.onResolvedCallbacks.forEach(function(fn){
                fn();
            })
        }
    }
    
    function reject(reason){
        if( self.status === 'pending'){//只能从pending状态切换到rejected状态
            self.status = 'rejected';
            self.reason = reason;
            self.onRejectedCallbacks.forEach(function(fn){
                fn();
            })
        }
    }
    try{
        executor(resolve,reject);
    }catch(e){
        reject(e)
    }
}

Promise.prototype.then = function(onFulfilled,onRejected){
    let self = this;
    if(self.status === 'fulfilled'){
        onFulfilled(self.value);
    }
    if(self.status === 'rejected'){
        onRejected(self.reason);
    }
   
    if(self.status === 'pending'){
        self.onResolvedCallbacks.push( function(){
            onFulfilled(self.value)
        });
        self.onRejectedCallbacks.push( function(){
            onRejected(self.reason)
        });
    }
}

let promise = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
})
promise.then(function(data){
    console.log('data',data);
},function(err){
    console.log('err',err);
})
promise.then(function(data){
    console.log('data',data);
},function(err){
    console.log('err',err);
})
promise.then(function(data){
    console.log('data',data);
},function(err){
    console.log('err',err);
})