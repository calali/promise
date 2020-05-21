function Promise (executor){
    const self = this
    this.state = 'pending'
    this.value = undefined

    this.resolveCallback = undefined
    this.rejectCallback = undefined

    function resolve(data){
        if(self.state === 'pending'){
            self.state = 'resolved'
            self.value = data
            if(self.resolveCallback){
                self.resolveCallback(data)
            }
            
            // resolveCallback.forEach(fn => {
            //     fn()
            // })
        }
    }

    function reject (reason){
        if(self.state === 'pending'){
            self.state = 'rejected'
            self.value = reason
            // resolveCallback.forEach(fn => {
            //     fn()
            // })
            if(self.rejectCallback){
                self.rejectCallback(reason)
            }
            
        }
    }

    executor(resolve,reject)
}

Promise.prototype.then = function (onFulfilled,onRejected){
    if(this.state === 'pending'){
        this.resolveCallback = onFulfilled
        this.rejectCallback  = onRejected
    }

    if(this.state === 'resolved'){
        onFulfilled(this.value)
    }

    if(this.state === 'rejected'){
        onRejected(this.value)
    }
}

new Promise(function(resolve,reject){
    resolve(123)
    // setTimeout(function(){
    //     resolve(123)
    // },0)
}).then(function(data){
    console.log('success',data)
},function(reason){
    console.log('fail',reason)
})