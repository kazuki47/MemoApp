import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { folderService, memoService } from '../services/db';

const Settings = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleResetDatabase = async () => {
    try {
      // すべてのメモを削除
      const memos = await memoService.getAll();
      await Promise.all(memos.map(memo => memoService.delete(memo.id)));
      
      // すべてのフォルダを削除
      const folders = await folderService.getAll();
      await Promise.all(folders.map(folder => folderService.delete(folder.id)));
      
      setConfirmDialogOpen(false);
      setNotification({
        open: true,
        message: 'データベースがリセットされました',
        severity: 'success'
      });
    } catch (error) {
      console.error('データベースリセットエラー:', error.message, error);
      setNotification({
        open: true,
        message: `データベースのリセットに失敗しました: ${error.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>設定</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>データ管理</Typography>
        <Button 
          variant="contained" 
          color="error"
          onClick={() => setConfirmDialogOpen(true)}
        >
          すべてのデータをリセット
        </Button>
      </Box>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>データベースをリセット</DialogTitle>
        <DialogContent>
          <DialogContentText>
            すべてのフォルダとメモを削除します。この操作は元に戻せません。
            続行しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleResetDatabase} color="error">リセット</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
