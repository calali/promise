promise的出现为了解决回调地狱


典型的回调地狱：


promise

状态默认 pending，可以变为fulfilled或reject,然后状态不可变。

立即执行函数fn

回调函数onFufilled OnRejected

