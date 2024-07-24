import axios from "axios";
const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/v1',
    headers: {'X-Custom-Header': 'foobar','Content-Type': 'application/json', 'accept': 'application/json',"userId":getCookie('glmUserId')}
  });

// 正在进行中的请求列表
let reqList:any = []

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function (reqList:string[], url:string, cancel:Function, errorMessage:string) {
  const errorMsg = errorMessage || ''
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url) {
      cancel(errorMsg)
      return
    }
  }
  reqList.push(url)
}

/**
 * 允许某个请求可以继续进行
 * @param {array} reqList 全部请求列表
 * @param {string} url 请求地址
 */
const allowRequest = function (reqList:string[], url:string) {
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url) {
      reqList.splice(i, 1)
      break
    }
  }
}



// 请求拦截器
instance.interceptors.request.use(
  (config:any) => {
    let cancel:any
      // 设置cancelToken对象
    config.cancelToken = new axios.CancelToken(function(c) {
        cancel = c
    })
    // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    stopRepeatRequest(reqList, config.url, cancel, `{"stop":"${config.url}"}`)
    return config
  },
  err => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
 (response:any) => {
    // 增加延迟，相同请求不得在短时间内重复发送
   return new Promise((resolve,reject)=>{
    setTimeout(() => {
        allowRequest(reqList, response.config.url)
    }, 1000)
    resolve(response)
   })
    // ...请求成功后的后续操作
    // successHandler(response)
  },
 (error:any) => {
    return new Promise((resolve,reject)=>{
        // 增加延迟，相同请求不得在短时间内重复发送
        if(error.message!=='Network Error'){
            error.status=0
            setTimeout(() => {
                allowRequest(reqList, JSON.parse(error.message).stop)
            }, 1000)
            resolve(error)
        }
        // ...请求失败后的后续操作
        // errorHandler(error)
    })
      
  }
)


/**检查用户并带回记录 */
export function checkUser(){
    let userId=getCookie('glmUserId')
    return new Promise((resolve,reject)=>{
        instance.post('/user',{uid:userId||'0'}).then((res)=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
    
}
/**插入新空白对话，不带回数据
 * @param payload 对话内容
 */
export function newEmptyChat(payload:any){
    let msg={
        "userId":getCookie('glmUserId'),
        "chat":payload
    }
    return new Promise((resolve,reject)=>{
        instance.post('/insert',msg).then(res=>{
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
    
}
/**发起对话，流式传输接收
 * @param payload.chatId 对话id
 * @param payload.history 对话内容
 */
export function addChat(payload:any){
    let msg={
        "model": "chatglm3-6b",
        "userId":getCookie('glmUserId'),
        "chatId":payload.chatId,
        "messages": payload.history,
        "stream": true,
        "max_tokens": 2000,
        "temperature": 0.8,
        "top_p": 0.8
    }
    return  fetch('http://127.0.0.1:8000/v1/chat/completions', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg)
        })
}
/**删除对话
 * @param chatId 对话id
 */
export function deleteChat(chatId:string){
    return new Promise((resolve,reject)=>{
        instance.delete(`/delete/`+getCookie('glmUserId')+'?param='+chatId).then(res=>{
            resolve(res)
        }).catch(err=>reject(err))
    })
    
}
/**因后端流式传输限制，前端接受完毕再返回后端写入数据 
 * @param  msg.curChat：chatId
 * @param  msg.newWord：完整消息
*/
export function returnResponseToFile(msg:{chatId:string,newWord:string}){
    let data={
        userId:getCookie('glmUserId'),
        chatId:msg.chatId,
        messages:{
            role:'assistant',
            content:msg.newWord,
        }
    }
    return new Promise((resolve,reject)=>{
        instance.post(`/returnResponse/`,data).then(res=>{
            resolve(res)
        }).catch(err=>reject(err))
    })
}
/**修改题目
 * @param {string} chatId 对话id 
 * @param {string} title 新标题 
 */
export function changeTitle(chatId:string,title:string){
    return new Promise((resolve,reject)=>{
        instance.post('/reTitle',{userId:getCookie('glmUserId'),chatId,title}).then((res)=>{
            resolve(res)
        }).catch(err=>reject(err))
    })
}
/**下载记录
 * 
 */
export function downloadChat(chatId:string){
    return new Promise((resolve,reject)=>{
        instance.get('/downloadChat/'+getCookie('glmUserId')+'?param='+chatId).then((res)=>{
            let data = res.data.history
            if(data.length>0){
                let str=''
                for(let i =0;i<data.length;i++){
                    if(data[i].role==='user'){
                        str+='用户：'+data[i].content+'\n'
                    }else if(data[i].role==='assistant'){
                        str+='AI：'+data[i].content+'\n'
                    }else{
                        str+=data[i].role+'：'+data[i].content+'\n'
                    }
                }
                downloadTxt('chat.txt',str)
            }
        })
    })
}
/**获取cookie
 * @param {string} name cookie名
 */
export function getCookie(name:string) {
    var cookieArr = document.cookie.split(";");
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if(name===cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
/**
*@param fileName txt文件名称
*@param content 文件内容(string)
*/
function downloadTxt(fileName:string, content:string) {
    let a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + content
    a.download = fileName
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
