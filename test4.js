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
    if(this.state === 'pending'){
        return new Promise(function(resolve,reject){

            self.resolveCallback.push(function(){
                var x = onFulfilled(self.value)
                resolve(x)
            })
            self.rejectCallback.push(function(){
                var x = onRejected(self.value)
                reject(x)
            })
        })
        
    }

    if(this.state === 'resolved'){
        return new Promise(function(resolve,reject){
            var x = onFulfilled(self.value)
            resolve(x)
        })
        
    }

    if(this.state === 'rejected'){
        return new Promise(function(resolve,reject){
            var x = onRejected(self.value)
            reject(x)
        })
    }
}

const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
    
})

promise1.then(function(data){
    console.log('success',data)
    return 456
    // return new Promise(function(resolve,reject){
    //     resolve(456)
    // })
},function(reason){
    console.log('fail',reason)
}).then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason)
})

