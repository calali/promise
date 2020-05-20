function Promise1(executor){ 
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


Promise1.prototype.then = function(onFulfilled,onRejected){
    let self = this;
    let promise2;//then返回的新Promise
    if(self.status === 'fulfilled'){
        promise2 = new Promise1(function (resolve,reject) {
               let x= onFulfilled(self.value);
               resolvePromise(promise2,x,resolve,reject);
        });
    }
    if(self.status === 'rejected'){
        promise2 = new Promise1(function (resolve,reject) {
                let x= onRejected(self.reason);
                resolvePromise(promise2,x,resolve,reject);
           
        });
    }
    if(self.status === 'pending'){
        promise2 = new Promise1(function (resolve,reject) {
            self.onResolvedCallbacks.push( function(){
                 try{
                    let x= onFulfilled(self.value);
                    resolve(x)
                    // resolvePromise(promise2,x,resolve,reject);
                }catch (e){
                    reject(e);
                }
            });
            self.onRejectedCallbacks.push( function(){
                 try{
                    let x= onRejected(self.reason);
                    resolvePromise(promise2,x,resolve,reject);
                }catch (e){
                    reject(e);
                }
            });
        });
    }
    return promise2;
}

function resolvePromise(p2,x,resolve,reject){
    if(p2 === x){ //报一个类型错误
         return reject(new TypeError('循环引用了'));
    }
    //判断x是不是promise
    if(x!== null || (typeof x === 'object'||typeof x === 'function')){
         //x可能是promise   看对象中是否有then方法，有then就认为是promise
         //取then方法有可能异常，发生异常就进入p2的失败态
         try {
             let then = x.then;
             if(typeof then === 'function'){ 
                 //认为x是一个promise,立刻执行该promise的then方法
                 //如果x进入成功态，会触发成功回调
                 then.call(x,function(y){ 
                     //y可能还是一个promise,继续解析，直到返回的是一个普通值
                     resolvePromise(p2,y,resolve,reject);
                     
                 },function(err){ //如果x进入失败态，会触发p2的失败态
                     reject(err);
                 });
 
             }else{ //如果then不是方法，直接认为返回一个对象，调用p2成功态
                 resolve(x);
             }
         } catch (error) {
             reject(error);
         }
         
    }else{ //x是普通值，调用p2成功态
         resolve(x);
    }
 };

new Promise1(function(resolve,reject){
    setTimeout(function(){
        resolve(123)
    },0)
}).then(function(data){
    console.log('data',data);
    return 456
    // return new Promise1(function(res,rej){
    //     rej(456)
    // })
},function(err){
    console.log('err',err);
}).then(function(data){
    console.log('data',data);
},function(err){
    console.log('err',err);
})