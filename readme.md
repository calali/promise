
function getUserId() {
    return new Promise1(function(resolve) {
        resolve('ok')
    })
}
getUserId().then(function(data) {
    //一些处理
    console.log(1,data);
    // resolve('ha')
    // return new Promise1(function(resolve){
    //     resolve('ha')
    // })
    return 'ha'
})
.then(function(data){
    console.log(2,data)
})


state = pending

value = null

callbacks = []

fn是传入的匿名函数，执行promise自己的resolve函数，并且参数是ok

state = fulfilled

value = ok

!!!回调函数：把callbacks里的函数都拿出来执行，用promise内部的handle

代码继续往下走，执行then函数，开启下一个new promise

    state = pending

    value = null

    callbacks = []

    fn是传入的匿名函数，内容是执行handle函数，并且把then的成功回调和promise的resolve传入。

    那么问题来了，在执行handle的时候，是谁的呢？执行的是外层的，代码断点state = fulfilled

    当promise是完成态的时候，直接执行成功回调，并把返回值ha传给返回的promise的resolve的参数，并执行

    state = fulfilled

    value = ha

    !!! 回调函数：把callbacks里的函数都拿出来执行，用promise内部的handle

        state = pending

        value = null

        callbacks = []

        执行handle函数

        执行console.log(2,'ha')


        state = fulfilled

        value = undefined

        !!! 回调函数

       



    

