import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FolderList from './components/FolderList';
import MemoList from './components/MemoList';
import MemoDetail from './components/MemoDetail';
import Settings from './components/Settings';
import { Box } from '@mui/material';

function App() {
  const [siteName, setSiteName] = useState('メモアプリ');

  // サイト名をローカルストレージに保存
  useEffect(() => {
    const savedSiteName = localStorage.getItem('siteName');
    if (savedSiteName) {
      setSiteName(savedSiteName);
    }
  }, []);

  // // サイト名が変更されたらローカルストレージに保存
  // const handleSiteNameChange = (newName) => {
  //   setSiteName(newName);
  //   localStorage.setItem('siteName', newName);
  // };

  return (
    <div className="app-container">
      <Sidebar siteName={siteName} onSiteNameChange={handleSiteNameChange} />
      
      <Box className="content">
        <Routes>
          <Route path="/" element={<Home siteName={siteName} />} />
          <Route path="/folders" element={<FolderList />} />
          <Route path="/folder/:folderId" element={<MemoList />} />
          <Route path="/memo/:memoId" element={<MemoDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </div>
  );
}

export default App;
