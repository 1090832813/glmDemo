import axios from "axios";
const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/v1',
    headers: {'X-Custom-Header': 'foobar','Content-Type': 'application/json', 'accept': 'application/json',"userId":getCookie('glmUserId')}
  });
export function getChatList() {
    return new Promise((resolve) =>
        instance.post('/chatList',{"userId":getCookie('userId')}).then(res=>{
            console.log(res)
        })
    );
}


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

export function addChat(payload:any){
    let msg={
        "model": "chatglm3-6b",
        "userId":getCookie('glmUserId'),
        "chatId":payload.chatId,
        "messages": payload.history,
        "stream": true,
        "max_tokens": 100,
        "temperature": 0.8,
        "top_p": 0.8
    }
    return   fetch('http://127.0.0.1:8000/v1/chat/completions', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg)
        })
        
    
     
    // return new Promise((resolve,reject)=>{
    //     instance.post('/chat/completions',msg,{responseType: 'stream'}).then((res:any)=>{
    //         console.log(res.data)
            
    //         // res.data.on('data',(chunk:any)=>{
    //         //     console.log(chunk)
    //         // });
    //         // res.data.on('end',()=>{
    //         //     console.log('end')
    //         //     resolve(res)
    //         // })
            
    //     }).catch(err=>reject(err))
    // })
    
}

export function deleteChat(chatId:string){
    return new Promise((resolve,reject)=>{
        instance.delete(`/delete/`+getCookie('glmUserId')+'?param='+chatId).then(res=>{
            resolve(res)
        }).catch(err=>reject(err))
    })
    
}

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