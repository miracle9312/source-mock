/**
 * Created by miracle on 2017/11/29.
 */
var Promise = require('./promise-mock2');
//错误类型默认白名单
var DEFAULT_WHITELIST = [
    TypeError,
    ReferenceError,
    RangeError
];

//指示是否开启报错机制
var enabled = false;

function disable() {
    enabled = false;
    Promise._onReject = null;
    Promise._onHandle = null;
}

/*@param options:Object{allRejetions:Boolean,
onHandled:Function,
onUnHandled:Function,
whiteList:Array} */
function enable(options) {
    options = options || {};
    if(enabled){disable()}
    enabled = true;
    var displayId = 0,
        rejections = {},
        id = 0;
    Promise._onHandle = function(promise){
        if(
            promise._state === 2 &&
            rejections[promise._rejectionId]
        ){
            if(rejections[promise._rejectionId].logged){
                onHandled(promise._rejectionId);
            }else{
                clearTimeout(rejections[promise._rejectionId].timeout);
            }

            delete rejections[promise._rejectionId];
        }
    };
    Promise._onReject = function(promise, err){
        if(promise._deferredState === 0){
            promise._rejectionId = id++;
            rejections[promise._rejectionId] = {//定义一个错误队列
                displayId : null,
                error: err,
                timeout: setTimeout(
                    onUnHandled.bind(null, promise._rejectionId),
                    matchWhitelist(err, DEFAULT_WHITELIST)?100 : 2000),
                logged:false
            }
        }
    };

    function onHandled(id){
        if(rejections[id].logged){
            if(options.onHandled){
                options.onHandled(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }else{
                console.warn(
                    'Promise Rejection Handled (id: ' + rejections[id].displayId + '):'
                );
                console.warn(
                    '  This means you can ignore any previous messages of the form "Possible Unhandled Promise Rejection" with id ' +
                    rejections[id].displayId + '.'
                );
            }
        }
    }

    function onUnHandled(id) {
        if(options.allRejections ||
            matchWhitelist(
                rejections[id].error,
                options.whitelist || DEFAULT_WHITELIST)){
            rejections[id].displayId = displayId ++;
            rejections[id].logged = true;
            if(options.onUnHandled){
                options.onUnHandled(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }else{
                logError(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }
        }
    }
}

function matchWhitelist(err, list) {
    return list.some(function(cls){
        return err instanceof cls;
    })
}

function logError(id, err){
    console.warn('Possible Unhandled Promise Rejection (id: ' + id + '):');
    var errStr = err && (err.stack || err)+ '';
    errStr.split('\n').forEach(function(line){
        console.warn('   ' + line);
    })
}

enable();

var p1 = new Promise(function(resolve, reject){
    x+1;
});

setTimeout(function(){
    p1.then(function(){
        console.log('test');
    })
}, 1000);