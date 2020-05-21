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
    if(this.state === 'pending'){
        this.resolveCallback.push(onFulfilled)
        this.rejectCallback.push(onRejected)
    }

    if(this.state === 'resolved'){
        onFulfilled(this.value)
    }

    if(this.state === 'rejected'){
        onRejected(this.value)
    }
}

const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
    
})

promise1.then(function(data){
    console.log('success',data)
},function(reason){
    console.log('fail',reason)
})

promise1.then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason)
})