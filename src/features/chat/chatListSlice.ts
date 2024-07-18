import { createSlice } from "@reduxjs/toolkit";
import { RootState } from '../../app/store';

const initialState:any={
    value:[],
    status: 'idle',
}

export const chatListSlice = createSlice({
    name: 'chatList',
    initialState,
    reducers: {
      //替换列表数据
      responseMsg: (state, action: any) => {
        state.value=action.payload
      },
      //列表中插入新chat
      addChatList:(state,action)=>{
        state.value.push(action.payload)
      },
      //列表中插入对应新数据
      insertResponse:(state,action)=>{
        for(let i =0;i<state.value.length;i++){
          if(state.value[i].id===action.payload.id){
            state.value[i].history.push(action.payload.chat);
            break;
          }
        }
      }
    },
    extraReducers: (builder) => {

    },
  });
  export const { addChatList,responseMsg,insertResponse } = chatListSlice.actions;
  export const selectChatList = (state: RootState) => state.chatList.value;
  export default chatListSlice.reducer;