import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import chatSlice from '../features/chat/chatSlice';
import chatListSlice from '../features/chat/chatListSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    chat:chatSlice,
    chatList:chatListSlice,
  },
  middleware:getDefaultMiddleware => getDefaultMiddleware({
    //关闭redux序列化检测
    serializableCheck:false
})
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
