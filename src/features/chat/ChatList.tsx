import { Flex, List } from "antd";
import { checkUser, deleteChat } from "./chatAPI";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {  responseMsg, selectChatList } from "./chatListSlice";
import { changeCurChatId, curChatId, renderMsg } from "./chatSlice";
import { CloseOutlined } from "@ant-design/icons";
export default function ChatList(){
    const input = useAppSelector(selectChatList);
    const curChat = useAppSelector(curChatId);
    const dispatch = useAppDispatch();
    const [show,setShow]=useState('')
    const init=()=>{
        //检查用户并获取所有chat记录
        checkUser().then((res:any)=>{
            if(res.status===200){
                document.cookie="glmUserId="+res.data.glmUserId+";expires=Fri, 31 Dec 9999 23:59:59 GMT";
                dispatch(responseMsg(res.data.chatList))
            }
        })
    }
    const delChat=(chatId:string)=>{
        deleteChat(chatId).then(()=>{
            init();
            dispatch(changeCurChatId(''))
            dispatch(renderMsg([]))
        })
    }
    useEffect(()=>{
        // console.log(input)
    },[input])
    useEffect(()=>{
        init();
    },[])
    return(<>
        <List
            itemLayout="horizontal"
            dataSource={input}
            renderItem={(item:any, index) =>{ 
                if(item.history)
                    return(
                        <List.Item key={item.id}  onMouseOver={()=>setShow(item.id)} onMouseOut={()=>setShow('')} style={{paddingLeft:10,paddingRight:10}} className={item.id===curChat?'active listItem':'listItem'} onClick={()=> dispatch(changeCurChatId(item.id))}>
                            <List.Item.Meta
                                title={<Flex justify="space-between">
                                        <div style={{whiteSpace:"nowrap",overflow:'hidden',textOverflow:'ellipsis'}} 
                                            title={item.title?item.title:item.history[0].content}
                                        >
                                            {item.title?item.title:item.history[0].content}
                                        </div>
                                        <CloseOutlined style={{display:show===item.id?'block':'none'}} onClick={()=>delChat(item.id)}/>
                                    </Flex>}
                            />
                        </List.Item>
                    )}
            }
        ></List>
    </>)
}