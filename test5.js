function Promise (executor){
    const self = this
    this.state = 'pending'
    this.value = undefined

    this.resolveCallback = []
    this.rejectCallback = []

    function resolve(data){
        if(self.state === 'pending'){
            self.state = 'resolved'
            self.value = data
            self.resolveCallback.forEach(fn => {
                fn(data)
            })
        }
    }

    function reject (reason){
        if(self.state === 'pending'){
            self.state = 'rejected'
            self.value = reason
            self.rejectCallback.forEach(fn => {
                fn(reason)
            })
        }
    }

    try{
        executor(resolve,reject)
    }catch(e){
        reject(e)
    }
    
}

Promise.prototype.then = function (onFulfilled,onRejected){
    var self = this
    var promise2
    if(this.state === 'pending'){
        promise2 = new Promise(function(resolve,reject){
            
            self.resolveCallback.push(function(){
                try{
                    var x = onFulfilled(self.value)
                    resolvePromise(promise2,x,resolve,reject)
                }catch(e){
                    reject(e)
                }
            })
            self.rejectCallback.push(function(){
                try{
                    var x = onRejected(self.value)
                    resolvePromise(promise2,x,resolve,reject)
                }catch(e){
                    reject(e)
                }
            })
        })
        
    }

    if(this.state === 'resolved'){
        promise2 =  new Promise(function(resolve,reject){
            try{
                var x = onFulfilled(self.value)
                resolvePromise(promise2,x,resolve,reject)
            }catch(e){
                reject(e)
            }
        })
        
    }

    if(this.state === 'rejected'){
        promise2 =  new Promise(function(resolve,reject){
            try{
                var x = onRejected(self.value)
                resolvePromise(promise2,x,resolve,reject)
            }catch(e){
                reject(e)
            }
        })
    }
    return promise2
}
function resolvePromise(promise,x,resolve,reject){
    if(promise === x){
        throw new Error('promise循环引用')
    }
    if(x instanceof Promise){
        try{
            x.then(function(data){
                resolve(data)
            },function(reason){
                reject(reason)
            })
        }catch(e){
            reject(e)
        }
        

    }else{
        resolve(x)
    }
} 

const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        // resolve(123)
        reject(123)
    },0)
})

promise1.then(function(data){
    console.log('success',data)
    return new Promise(function(resolve,reject){
        resolve(456)
    })
},function(reason){
    console.log('fail',reason)
    return new Promise(function(resolve,reject){
        reject(789)
    })
})
.then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason)
})

