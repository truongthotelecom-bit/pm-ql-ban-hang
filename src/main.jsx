import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ConfigProvider, theme } from 'antd';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6', // Tím Neon sang trọng làm màu chủ đạo
          borderRadius: 10,
          colorBgContainer: '#0d1426',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
