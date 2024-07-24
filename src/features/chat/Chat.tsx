import { Flex, Input, List, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {  changeCurChatId, curChatId, inputMsg, inputStatus, insertMsg, refreshMsg,  selectChat, stopInput } from "./chatSlice";
import { useEffect, useRef, useState } from "react";
import { v4 } from 'uuid';
import { addChatList, insertResponse, selectChatList } from "./chatListSlice";
import { RobotFilled, UserOutlined } from "@ant-design/icons";
import { addChat, returnResponseToFile } from "./chatAPI";
// import { selectChatList } from "./chatListSlice";
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {solarizedlight} from 'react-syntax-highlighter/dist/esm/styles/prism'


export default function Chat(){
    const input = useAppSelector(selectChat);
    const waiting = useAppSelector(inputStatus);
    const curChat = useAppSelector(curChatId); 
    const chatList = useAppSelector(selectChatList);
    const chatBottom=useRef<any>()
    // const chatList = useAppSelector(selectChatList);
    const dispatch = useAppDispatch();
    const [curMsg,setCurMsg]=useState('')
    // const [curChatId,setCurChatId]=useState('')
    const submit=(e:any)=>{
        if(e.keyCode===13&&e.target.value!==''){
            let newId=v4()
            if(!curChat){
                dispatch(changeCurChatId(newId))
            }
            setCurMsg('')
            dispatch(inputMsg(e.target.value))
            let newData={id:curChat?curChat:newId,chat:{
                role:'user',
                content:e.target.value,
                function_call: null,
                name: null
            }}
            dispatch(insertResponse(newData))
            let copyHistory=JSON.parse(JSON.stringify(chatList))
            let result=newData.chat
            for(let i =0;i<copyHistory.length;i++){
                if(copyHistory[i].id===newData.id){
                    copyHistory[i].history.push(newData.chat)
                    result=copyHistory[i].history
                }
            }

            
            //是否为新增对话
            let ifNewChat=true;
            for(let i=0;i<chatList.length;i++){
                if(curChat===chatList[i].id)
                    ifNewChat=false
            }
            if(ifNewChat){
                dispatch(addChatList({
                    id:curChat?curChat:newId,
                    history:[result]
                }))
            }
            dispatch(insertMsg('...'))
            dispatch(stopInput(true))
            addChat({history:ifNewChat?[result]:result,chatId:curChat?curChat:newId}).then((stream:any) => {
                const reader = stream.body.getReader();
                const transformer = new TransformStream();
                const writer = transformer.writable.getWriter();
                let decoder = new TextDecoder();
                let newWord=''
                let ifFinish=false;
                function readChunk() {
                reader.read().then((res:any) => {
                    if (res.done) {
                    // 数据流结束
                        console.log('Done reading the stream');
                        newWord=newWord.replace('\n ','')
                        let chatId=curChat?curChat:newId
                        returnResponseToFile({chatId,newWord}).then(()=>{
                            dispatch(stopInput(false))
                            dispatch(insertResponse({id:curChat?curChat:newId,chat:{
                                role:'assistant',
                                content:newWord,
                                function_call: null,
                                name: null
                            }}))
                        }).catch(err=>message.error(err))
                        return;
                    }
                    writer.write(res.value); // 写入转换后的数据
                    let objStr:any=decoder.decode(res.value).trim();
                    if(!ifFinish){
                        newWord+=JSON.parse(objStr.substring(6)).choices[0].delta.content
                        // arr.forEach(item=>{
                           newWord = newWord.replaceAll(/ChatGLM3-6B|清华大学 KEG 实验室|清华大学KEG实验室|智谱 AI 公司|智谱AI公司|Tsinghua University KEG Lab|Zhipu AI Company/g, " ")
                        // })
                        ifFinish=JSON.parse(objStr.substring(6)).choices[0].finish_reason==='stop'?true:false
                        if(!ifFinish)
                            dispatch(refreshMsg(newWord+'...'))
                        else
                            dispatch(refreshMsg(newWord))
                    }
                    // dispatch(refreshMsg(newWord+'...'))
                    setTimeout(readChunk, 1000); // 延时1秒后继续读取下一个数据块
                });
                }
                readChunk(); // 启动读取流程
            }).catch(err=>message.error(err))
        }
    }
    const changeInput=(e:any)=>{
        setCurMsg(e.target.value)
    }
    useEffect(()=>{
        chatBottom.current.scrollIntoView()
    },[curChat])
    useEffect(()=>{
       if(waiting===true){
        chatBottom.current.scrollIntoView({ behavior: "smooth" })
       }
    },[waiting])
    return (<Flex justify="space-between" style={{paddingTop:50,height:'100%'}} align="center" vertical={true} >
        <div className="show"  style={{width:'60%',overflowY:'auto',height:document.body.scrollHeight-164}}>
            <List
                itemLayout="horizontal"
                dataSource={input}
                renderItem={(item:any, index) =>{ 
                    if(item.role!=='system')
                        return(
                            <List.Item style={{borderBlockEnd:'none'}}>
                                <List.Item.Meta
                                    avatar={<div style={{height:24,width:24,borderRadius:12,background:'white',textAlign:'center',lineHeight:'24px'}}>{item.role==='user'?<UserOutlined style={{color:'rgb(22,119,255)'}} />:<RobotFilled style={{color:'rgb(22,119,255)'}}/>}</div>}
                                    title={<div className="chatBody">
                                        <ReactMarkdown 
                                        children={item.content?item.content:''}
                                        components={{
                                            code(props) {
                                              const {children, className, node} = props
                                              const match = /language-(\w+)/.exec(className || '')
                                              return match ? (
                                                <SyntaxHighlighter
                                                  
                                                  PreTag="div"
                                                  children={String(children).replace(/\n$/, '')}
                                                  language={match[1]}
                                                  style={solarizedlight}
                                                />
                                              ) : (
                                                <code  className={className}>
                                                  {children}
                                                </code>
                                              )
                                            }
                                          }}
                                        ></ReactMarkdown>
                                        </div>}
                                />
                            </List.Item>
                        )}
                }
            ></List>
            <div style={{ float:"left", clear: "both" }}
             ref={chatBottom}>
            </div>
        </div>
        <div style={{width:'60%',paddingBottom:50,bottom:0,background:'rgb(245,245,245)'}}>
            <Input placeholder="请输入..." style={{padding:20}} disabled={waiting} value={curMsg} onChange={changeInput} onKeyUp={submit} ></Input>
        </div>
    </Flex>)
}