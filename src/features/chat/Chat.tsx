import { Flex, Input, List } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {  changeCurChatId, curChatId, inputMsg, insertMsg, refreshMsg, renderMsg, selectChat } from "./chatSlice";
import { useEffect, useState } from "react";
import { v4 } from 'uuid';
import { addChatList, insertResponse, selectChatList } from "./chatListSlice";
import { RobotFilled, UserOutlined } from "@ant-design/icons";
import { addChat } from "./chatAPI";
// import { selectChatList } from "./chatListSlice";

export default function Chat(){
    const input = useAppSelector(selectChat);
    const curChat = useAppSelector(curChatId); 
    const chatList = useAppSelector(selectChatList);
    // const chatList = useAppSelector(selectChatList);
    const dispatch = useAppDispatch();
    const [curMsg,setCurMsg]=useState('')
    // const [curChatId,setCurChatId]=useState('')
    const submit=(e:any)=>{
        if(e.keyCode===13){
            let newId=v4()
            if(!curChat){
                dispatch(changeCurChatId(newId))
            }
            dispatch(inputMsg(e.target.value))
            dispatch(insertResponse({id:curChat?curChat:newId,chat:{
                role:'user',
                content:e.target.value
            }}))
            setCurMsg('')
        }
    }
    const changeInput=(e:any)=>{
        setCurMsg(e.target.value)
    }
    useEffect(()=>{
        // console.log(chatList)
        for(let i =0;i<chatList.length;i++){
            if(chatList[i].id===curChat){
                dispatch(renderMsg(chatList[i].history))
            }
        }
    },[curChat])
    useEffect(()=>{
        //当用户提交新对话，内容变化时
        if(input.length>0&&input[input.length-1].role==='user'){
            //是否为新增对话
            let ifNewChat=true;
            for(let i=0;i<chatList.length;i++){
                if(curChat===chatList[i].id)
                    ifNewChat=false
            }
            if(ifNewChat){
                dispatch(addChatList({
                    id:curChat,
                    history:input
                }))
            }
            dispatch(insertMsg(''))
            addChat({history:input,chatId:curChat}).then((stream:any) => {
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
                    return;
                    }
                    writer.write(res.value); // 写入转换后的数据
                    let objStr:any=decoder.decode(res.value).trim();
                    if(!ifFinish){
                        newWord+=JSON.parse(objStr.substring(6)).choices[0].delta.content
                        ifFinish=JSON.parse(objStr.substring(6)).choices[0].finish_reason==='stop'?true:false
                    }
                    console.log(newWord)
                    dispatch(refreshMsg(newWord))
                    setTimeout(readChunk, 1000); // 延时1秒后继续读取下一个数据块
                });
                }
                readChunk(); // 启动读取流程
            
          })
        }
    },[input])
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
                                    avatar={item.role==='user'?<UserOutlined />:<RobotFilled />}
                                    title={<div>{item.content}</div>}
                                />
                            </List.Item>
                        )}
                }
            ></List>
        </div>
        <div style={{width:'60%',paddingBottom:50,bottom:0,background:'rgb(245,245,245)'}}>
            <Input style={{padding:20}} value={curMsg} onChange={changeInput} onKeyUp={submit} ></Input>
        </div>
    </Flex>)
}