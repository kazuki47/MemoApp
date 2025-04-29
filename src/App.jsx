import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// サイドバーをインポート
import Sidebar from './components/Sidebar';
// フォルダリストコンポーネントをインポート
import FolderList from './components/FolderList';
import MemoList from './components/MemoList';
// MemoDetailコンポーネントをインポート
import MemoDetail from './components/MemoDetail';
import Settings from './components/Settings';

// Homeコンポーネント
function Home({ siteName = "メモアプリ" }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/folders');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        {siteName}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        あなたのメモを簡単に管理
      </Typography>
      <Button 
        variant="contained" 
        size="large" 
        onClick={handleStart}
        sx={{ mt: 2 }}
      >
        Start
      </Button>
    </Box>
  );
}

// メインレイアウトコンポーネント（サイドバー付き）
function MainLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

// Foldersコンポーネント
function Folders() {
  return (
    <Box>
      <FolderList />
    </Box>
  );
}

// MemoListコンポーネント
function MemoListPage() {
  return (
    <Box>
      <MemoList />
    </Box>
  );
}

// MemoDetailコンポーネント
function MemoDetailPage() {
  return (
    <Box>
      <MemoDetail />
    </Box>
  );
}

function SettingPage() {
  return (
    <Box>
      <Settings />
    </Box>
  );
}

// メインアプリケーションコンポーネント
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home siteName="メモアプリ" />} />
        {/* サイドバー付きのレイアウトを適用 */}
        <Route element={<MainLayout />}>
          <Route path="/folders" element={<Folders />} />
          <Route path="/folders/:folderId/memos" element={<MemoListPage />} />
          <Route path="/folders/:folderId/memos/:memoId" element={<MemoDetailPage />} />
          <Route path="/folder/:folderId" element={<MemoListPage />} />
          <Route path="/memo/:memoId" element={<MemoDetailPage />} />
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
