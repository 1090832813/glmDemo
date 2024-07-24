import { Button, Flex, Input, Layout, Menu, message, Modal } from 'antd';
import './App.css';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import { useState } from 'react';
import { CloseOutlined, HistoryOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from '@ant-design/icons';
import ChatList from './features/chat/ChatList';
import Chat from './features/chat/Chat';
import { canTitle, changeCurChatId, curChatId, ifTitleForNew, reTitle, tempTitle, titleIsNew, titleStatus } from './features/chat/chatSlice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { addChatList, responseMsg } from './features/chat/chatListSlice';
import { v4 } from 'uuid';
import { changeTitle, checkUser, newEmptyChat } from './features/chat/chatAPI';
import logo from './kunwosoft Logo.png'
function App() {
  const openTitle = useAppSelector(titleStatus);
  const title = useAppSelector(tempTitle);
  const titleForNew=useAppSelector(titleIsNew)
  const curChat = useAppSelector(curChatId); 
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [showHistory,setShowHistory]=useState(true)
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const items = [
    { key: '1', label: '智能助手' , icon: <PieChartOutlined />},
    { key: '2', label: '长文档解读' , icon: <PieChartOutlined />},
    { key: '3' , label: 'AI搜索' , icon: <PieChartOutlined />},
    { key: '4' , label: 'AI画图' , icon: <PieChartOutlined />},
    { key: '5' , label: '数据分析' , icon: <PieChartOutlined />},
  ]
  const newTitle=()=>{

    if(titleForNew){
      let newId=v4()
      let data={
        "id":newId,
        "title":title,
        "history":[]
      }
    dispatch(addChatList(data))
    newEmptyChat(data).then(()=>{
      dispatch(changeCurChatId(newId))
    }).catch(err=>message.error(err))
    dispatch(canTitle(false))
    dispatch(reTitle(''))
    }else{
      changeTitle(curChat,title).then(()=>{
        dispatch(canTitle(false))
        dispatch(reTitle(''))
        return checkUser()
      }).then((res:any)=>{
        if(res.status===200){
            document.cookie="glmUserId="+res.data.glmUserId+";expires=Fri, 31 Dec 9999 23:59:59 GMT";
            dispatch(responseMsg(res.data.chatList))
        }
    })
    }
  }
  const newChat=()=>{
    dispatch(ifTitleForNew(true))
    dispatch(canTitle(true))
  }
  
  return (
    <div className="App">
      <Modal title="标题" open={openTitle} onOk={newTitle} onCancel={()=>dispatch(canTitle(false))}>
        <Input value={title} onChange={(e)=>{dispatch(reTitle(e.target.value))}}></Input>
      </Modal>
      <Layout>
        <Sider collapsed={collapsed} theme='light'>
            <img src={logo} style={{marginLeft:8,marginTop:8}} height={40} alt="" />  
            <Flex style={{width:80,height:40,float:'right'}} justify='space-between' align='center'>
              {showHistory?<div></div>:<Button onClick={()=>setShowHistory(true)} style={{paddingLeft:10,paddingRight:10 ,border:'none',boxShadow:'none'}}><HistoryOutlined /></Button>}
              <Button  onClick={toggleCollapsed} style={{paddingLeft:10,paddingRight:10,border:'none',boxShadow:'none'}}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
            </Flex>
            <Menu
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              theme="light"
              items={items}
            />
        </Sider>
        {showHistory&&
        <Flex className='chatList' justify='start'  vertical={true} >
          <Flex justify='space-between' style={{margin:10}}>
            <div style={{fontSize:16,fontWeight:600}}>历史记录</div> 
            <CloseOutlined onClick={()=>setShowHistory(false)}/>
          </Flex>
          <Button type='primary' style={{margin:10}} onClick={newChat}>新建对话</Button>
          <div style={{maxHeight:document.body.scrollHeight-94,overflowY:'auto'}}><ChatList></ChatList></div>
        </Flex>}
        <Content>
          <Chat></Chat>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
