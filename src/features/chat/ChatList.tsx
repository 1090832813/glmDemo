import { Flex, List, message } from "antd";
import { checkUser, deleteChat, downloadChat } from "./chatAPI";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {  responseMsg, selectChatList } from "./chatListSlice";
import { canTitle, changeCurChatId, curChatId, ifTitleForNew, renderMsg } from "./chatSlice";
import { CloseOutlined, CloudDownloadOutlined, EditOutlined } from "@ant-design/icons";
export default function ChatList(){
    // const input = useAppSelector(selectChatList);
    const chatList = useAppSelector(selectChatList);
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
        }).catch(err=>message.error(err))
    }
    const changeTitle=(data:any)=>{
        dispatch(ifTitleForNew(false))
        dispatch(changeCurChatId(data.id))
        dispatch(canTitle(true))
    }
    const selectNav=(id:string)=>{
        dispatch(changeCurChatId(id))
        for(let i =0;i<chatList.length;i++){
                    if(chatList[i].id===id){
                         dispatch(renderMsg(chatList[i].history))
                     }
                 }
    }
    useEffect(()=>{
        init();
    },[])
    return(<>
        <List
            itemLayout="horizontal"
            dataSource={chatList}
            renderItem={(item:any, index) =>{ 
                if(item.history)
                    return(
                        <List.Item key={item.id}  onMouseOver={()=>setShow(item.id)} onMouseOut={()=>setShow('')} style={{paddingLeft:10,paddingRight:10}} className={item.id===curChat?'active listItem':'listItem'} onClick={()=>{selectNav(item.id)}}>
                            <List.Item.Meta
                                title={<Flex justify="space-between">
                                        <div style={{whiteSpace:"nowrap",overflow:'hidden',textOverflow:'ellipsis'}} 
                                            title={item.title?item.title:item.history.length>0?item.history[0].content:''}
                                        >
                                            {item.title?item.title:item.history.length>0?item.history[0].content:''}
                                        </div>
                                        <div style={{textWrap:'nowrap',display:show===item.id?'block':'none'}}>
                                            <EditOutlined title="修改标题" className="iconBtn" style={{marginRight:5}} onClick={()=>changeTitle(item)}/>
                                            <CloudDownloadOutlined title="下载" className="iconBtn" style={{marginRight:5}} onClick={(e)=>{e.stopPropagation();downloadChat(item.id)}}/>
                                            <CloseOutlined title="删除" className="iconBtn"   onClick={(e)=>{e.stopPropagation();delChat(item.id)}}/>
                                        </div>
                                    </Flex>}
                            />
                        </List.Item>
                    )
                }
            }
        ></List>
    </>)
}