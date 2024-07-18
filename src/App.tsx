import { Button, Flex, Input, Layout, Menu, Modal } from 'antd';
import './App.css';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import { useState } from 'react';
import { CloseOutlined, HistoryOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from '@ant-design/icons';
import ChatList from './features/chat/ChatList';
import Chat from './features/chat/Chat';
import { canTitle, changeCurChatId, reTitle, tempTitle, titleStatus } from './features/chat/chatSlice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { addChatList } from './features/chat/chatListSlice';
import { v4 } from 'uuid';
import { newEmptyChat } from './features/chat/chatAPI';
function App() {
  const openTitle = useAppSelector(titleStatus);
  const title = useAppSelector(tempTitle);
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [showHistory,setShowHistory]=useState(true)
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const items = [
    { key: '1', label: 'ChatGLM' , icon: <PieChartOutlined />},
    { key: '2', label: '长文档解读' , icon: <PieChartOutlined />},
    { key: '3' , label: 'AI搜索' , icon: <PieChartOutlined />},
    { key: '4' , label: 'AI画图' , icon: <PieChartOutlined />},
    { key: '5' , label: '数据分析' , icon: <PieChartOutlined />},
  ]
  const newTitle=()=>{
    let newId=v4()
    let data={
        "id":newId,
        "title":title,
        "history":[]
      }
    dispatch(addChatList(data))
    newEmptyChat(data).then(()=>{
      dispatch(changeCurChatId(newId))
    })
    dispatch(canTitle(false))
    dispatch(reTitle(''))
  }
  const newChat=()=>{
    dispatch(canTitle(true))
  }
  return (
    <div className="App">
      <Modal title="标题" open={openTitle} onOk={newTitle} onCancel={()=>dispatch(canTitle(false))}>
        <Input value={title} onChange={(e)=>{dispatch(reTitle(e.target.value))}}></Input>
      </Modal>
      <Layout>
        <Sider collapsed={collapsed} theme='light'>
            <Flex style={{width:80,float:'right'}} justify='space-between'>
              
              {showHistory?<div></div>:<Button onClick={()=>setShowHistory(true)} style={{paddingLeft:10,paddingRight:10, marginBottom: 16 ,border:'none',boxShadow:'none'}}><HistoryOutlined /></Button>}
              <Button  onClick={toggleCollapsed} style={{paddingLeft:10,paddingRight:10, marginBottom: 16 ,border:'none',boxShadow:'none'}}>
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
