# promise的实现原理

在我们写代码的过程中用过了无数次promise，那么promise是如何实现的呢？

今天我们来一步步实现一个较为完善的promise。

相信有一部分同学已经知道了原理，那么可以温故知新，大家再一起学习下。

### 1基本promise的实现

![promise状态](https://user-gold-cdn.xitu.io/2020/5/21/172367c718308a89?w=318&h=174&f=png&s=15997)


promise有3个状态：pending resolved rejected，并且只能单向地从pending状态向resolved和rejected状态转换，且状态只能转换一次，之后保持最终态。

我们看一个基本的promise的用法。

```
new Promise(function(resolve,reject){
    resolve(123)
    // reject(456)
}).then(function(data){
    console.log('success',data) // success 123
},function(reason){
    console.log('fail',reason)
})
```

把传入Promise的方法称为executor，executor在promise构造时立即执行。
传入then方法的参数，第一个onFulfilled函数，参数为Promise resolve时的参数，在promise状态为resolved后执行；第二个onRejected函数，参数为Promise reject时的参数，在promise状态为rejected后执行；

123或456这样的参数成为promise的终值。

由此我们实现一个基本的promise

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
        }
    }

    function reject (reason){
        if(self.state === 'pending'){
            self.state = 'rejected'
            self.value = reason
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

### 2 executor里面包含异步函数
走到then时是pending状态
```
new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
}).then(function(data){
    console.log('success',data)
},function(reason){
    console.log('fail',reason)
})
```
### 3 executor函数里有throw error处理的情况
```
try{
    executor(resolve,reject)
}catch(e){
    reject(e)
}
```
### 4 注册多个then
回调放在数组中

```
function Promise (executor){
// 省略

this.resolveCallback = []
this.rejectCallback = []

// 省略

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

// 省略

}
```

### 5链式调用

不返回同一个promise
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

因此then函数不返回当前的this,而返回新的promise

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


### 6链式调用时返回promise
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

```
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
```

### 7穿透
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
### 8异步执行
参考[promise A+规范](https://www.ituring.com.cn/article/66566)规范：
![promise状态](https://user-gold-cdn.xitu.io/2020/5/21/172367ce0a95806b?w=320&h=54&f=png&s=10476)
then函数回调应当异步执行。因此需要把then函数返回的promise的executor用异步函数包围来实现异步。


###  总结
promise实现的核心是then的处理，其他的方法
promise.all,promise.race,promise.reject, promise.resolve , promise.catch在then明确后就容易写了。

### 讨论
我们实现的Promise和浏览器内置的promise的实现可能有什么不同？

### 参考资料
https://juejin.im/post/5ab466a35188257b1c7523d2  
https://www.ituring.com.cn/article/66566  
https://stackoverflow.com/questions/59503772/is-the-javascript-es6-promise-exactly-the-same-as-promise-a