import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

interface AppProps {
  children: React.ReactNode;
}

function App(props: AppProps) {
  useEffect(() => {
    console.log('[App] 应用启动');
  }, []);

  useDidShow(() => {
    console.log('[App] 页面显示');
  });

  useDidHide(() => {
    console.log('[App] 页面隐藏');
  });

  return props.children;
}

export default App;
