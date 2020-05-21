# promise的实现原理

### 基本promise的实现

promise有3个状态：pending resolved rejected，并且只能单向地从pending状态向resolved和rejected状态转换，且状态只能转换一次，之后保持最终态。

我们看一个基本的promise的用法。

```
new Promise(function(resolve,reject){
    resolve(123)
}).then(function(data){
    console.log('success',data)
},function(reason){
    console.log('fail',reason)
})
```

把传入Promise的方法称为executor，在promise构造时立即执行。
传入then方法的参数，第一个onFulfilled函数，参数为Promise resolve时的参数；第二个onRejected函数，参数为Promise reject时的参数；
当promise resolve时执行onFulfilled,reject时执行onRejected。

由此我们实现一个最基本的通过上面测试的promise

```
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
            // rejectCallback.forEach(fn => {
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
```

### executor里面包含异步函数
走到then时是pending状态

### executor函数里有throw error处理的情况
```
try{
    executor(resolve,reject)
}catch(e){
    reject(e)
}
```
### 注册多个then

```
this.resolveCallback = []
this.rejectCallback = []
```

### 链式调用且不返回同一个promise
```
const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
    
})
const promise2 = promise1.then(function (data){
    return 456
},function(reason){
    console.log('reason',reason)
})
console.log('compare',promise1 == promise2) // false
```

then函数返回新的promise

```
promise1.then(function(data){
    console.log('success',data)
    return 456
},function(reason){
    console.log('fail',reason)
}).then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason)
})
```

```
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
```
### 链式调用时返回promise
```
const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
    
})

promise1.then(function(data){
    console.log('success',data)
    return new Promise(function(resolve,reject){
        resolve(456)
    })
},function(reason){
    console.log('fail',reason)
}).then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason)
})
```

### 穿透
```
const promise1 = new Promise(function(resolve,reject){
    setTimeout(function(){
        // resolve(123)
        reject(123)
    },0)
})

promise1.then().then()
.then(function(data){
    console.log('success1',data)
},function(reason){
    console.log('fail1',reason) // fail1 123
})
```

解决方案

```
Promise.prototype.then = function (onFulfilled,onRejected){
    // 省略

    onFulfilled = typeof onFulfilled === function ?  onFulfilled : function(data){return data}
    onRejected = typeof onRejected === function ?  onRejected : function(data){return data}

    // 省略
}

```

###  总结
promise实现的核心是then的处理，其他的方法
promise.all,promise.race,promise.reject, promise.resolve , promise.catch在then明确后就容易写了。

### 参考资料
https://juejin.im/post/5ab466a35188257b1c7523d2
https://www.ituring.com.cn/article/66566
https://stackoverflow.com/questions/59503772/is-the-javascript-es6-promise-exactly-the-same-as-promise-a