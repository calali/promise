把代码执行的顺序写下来
state = pending

value = null

callbacks = []

fn是传入的匿名函数，执行promise自己的resolve函数，并且参数是ok

state = fulfilled

value = ok

!!!回调函数：把callbacks里的函数都拿出来执行，用promise内部的handle

代码继续往下走，执行then函数，开启副本new promise

    state = pending

    value = null

    callbacks = []

    fn是传入的匿名函数，内容是执行handle函数，并且把then的成功回调和promise的resolve传入。

    那么问题来了，在执行handle的时候，是谁的呢？执行的是外层的，代码断点state = fulfilled

    当promise是完成态的时候，直接执行成功回调，并把返回值传给返回的promise的resolve的参数，并执行

    

