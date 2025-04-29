import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RenameDialog from './RenameDialog';
import { memoService, folderService } from '../services/db';

const MemoList = () => {
  const { folderId } = useParams();
  const [memos, setMemos] = useState([]);
  const [folder, setFolder] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [currentMemo, setCurrentMemo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoToDelete, setMemoToDelete] = useState(null);

  const loadMemos = async () => {
    try {
      const memoList = await memoService.getByFolder(parseInt(folderId));
      setMemos(memoList);
    } catch (error) {
      console.error('Error loading memos:', error);
    }
  };

  const loadFolder = async () => {
    try {
      const folderData = await folderService.getAll();
      const currentFolder = folderData.find(f => f.id === parseInt(folderId));
      setFolder(currentFolder);
    } catch (error) {
      console.error('Error loading folder:', error);
    }
  };

  useEffect(() => {
    // データベース接続の初期チェック
    const checkDatabase = async () => {
      try {
        await memoService.getAll(); // データベース接続テスト
        console.log("データベース接続確認: 成功");
      } catch (error) {
        console.error("データベース接続確認: 失敗", error);
        setError("データベース接続に問題があります。アプリを再読み込みしてください。");
      }
    };
    
    checkDatabase();
    
    if (folderId) {
      loadMemos();
      loadFolder();
    }
  }, [folderId]);

  const handleCreateMemo = async () => {
    try {
      // フォルダIDが有効か確認
      if (!folderId || isNaN(parseInt(folderId))) {
        setError('有効なフォルダが選択されていません。');
        return;
      }
      
      setIsLoading(true);
      const now = new Date();
      const newMemo = { 
        title: '新規メモ', 
        content: '',
        folderId: parseInt(folderId),
        createdAt: now,
        updatedAt: now
      };
      
      console.log('Creating memo with data:', newMemo);
      // データベースが存在するか確認してから実行
      await memoService.add(newMemo);
      console.log('Memo created successfully');
      await loadMemos();
    } catch (error) {
      console.error('Error creating memo:', error);
      setError(`メモの作成に失敗しました: ${error.message || 'データベースエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameClick = (memo, event) => {
    event.preventDefault();
    setCurrentMemo(memo);
    setRenameDialogOpen(true);
  };

  const handleRenameMemo = async (newTitle) => {
    if (currentMemo && newTitle.trim() !== '') {
      try {
        await memoService.update({ ...currentMemo, title: newTitle });
        loadMemos();
      } catch (error) {
        console.error('Error renaming memo:', error);
      }
    }
  };

  const handleDeleteClick = (memo, event) => {
    event.preventDefault();
    setMemoToDelete(memo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMemo = async () => {
    try {
      setIsLoading(true);
      if (memoToDelete) {
        await memoService.delete(memoToDelete.id);
        await loadMemos();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      setError(`メモの削除に失敗しました: ${error.message || 'データベースエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {folder ? `${folder.name} のメモ` : 'メモ一覧'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
          onClick={handleCreateMemo}
          disabled={isLoading}
        >
          新規メモ
        </Button>
      </Box>

      <List>
        {memos.map((memo) => (
          <ListItem
            key={memo.id}
            component={Link}
            to={`/memo/${memo.id}`}
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 1
            }}
            secondaryAction={
              <Box onClick={(e) => e.stopPropagation()}>
                <IconButton 
                  edge="end" 
                  onClick={(e) => handleRenameClick(memo, e)}
                >
                  <DriveFileRenameOutlineIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  onClick={(e) => handleDeleteClick(memo, e)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText 
              primary={memo.title} 
              secondary={new Date(memo.updatedAt).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>

      {/* 名前変更ダイアログ */}
      <RenameDialog
        open={renameDialogOpen}
        title="メモのタイトル変更"
        initialValue={currentMemo?.title || ''}
        onSave={handleRenameMemo}
        onClose={() => setRenameDialogOpen(false)}
      />

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>メモの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{memoToDelete?.title}」を削除してもよろしいですか？
            この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleDeleteMemo} 
            color="error" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : null}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* エラー通知 */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemoList;
