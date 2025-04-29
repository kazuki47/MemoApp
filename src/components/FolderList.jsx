import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
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
import { folderService } from '../services/db';

const FolderList = () => {
  const [folders, setFolders] = useState([]);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const loadFolders = async () => {
    try {
      const folderList = await folderService.getAll();
      setFolders(folderList);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreateFolder = async () => {
    try {
      await folderService.add({ 
        name: '新規フォルダ', 
        createdAt: new Date()
      });
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleRenameClick = (folder, event) => {
    event.preventDefault();
    setCurrentFolder(folder);
    setRenameDialogOpen(true);
  };

  const handleRenameFolder = async (newName) => {
    if (currentFolder && newName.trim() !== '') {
      try {
        await folderService.update({ ...currentFolder, name: newName });
        loadFolders();
      } catch (error) {
        console.error('Error renaming folder:', error);
      }
    }
  };

  const handleDeleteClick = (folder, event) => {
    event.preventDefault();
    setFolderToDelete(folder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (folderToDelete) {
      try {
        console.log('削除開始:', folderToDelete.id);
        // 削除処理の実行
        const result = await folderService.delete(folderToDelete.id);
        console.log('削除完了:', result);
        // ダイアログを閉じる
        setDeleteDialogOpen(false);
        setFolderToDelete(null);
        // フォルダ一覧を再読み込み
        await loadFolders();
      } catch (error) {
        console.error('フォルダ削除エラー:', error);
        alert('フォルダの削除中にエラーが発生しました: ' + error.message);
      }
    } else {
      console.error('削除対象のフォルダが指定されていません');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">フォルダ一覧</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateFolder}
        >
          新規フォルダ
        </Button>
      </Box>

      {folders.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          フォルダがありません。「新規フォルダ」ボタンからフォルダを作成してください。
        </Alert>
      ) : (
        <List>
          {folders.map((folder) => (
            <ListItem
              key={folder.id}
              component={Link}
              to={`/folder/${folder.id}`}
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer'
                },
                transition: 'background-color 0.3s'
              }}
              secondaryAction={
                <Box onClick={(e) => e.stopPropagation()}>
                  <IconButton 
                    edge="end" 
                    onClick={(e) => handleRenameClick(folder, e)}
                  >
                    <DriveFileRenameOutlineIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    onClick={(e) => handleDeleteClick(folder, e)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText 
                primary={folder.name} 
                secondary={new Date(folder.createdAt).toLocaleDateString()}
              />
            </ListItem>
          ))}
        </List>
      )}

      <RenameDialog
        open={renameDialogOpen}
        title="フォルダの名前変更"
        initialValue={currentFolder?.name || ''}
        onSave={handleRenameFolder}
        onClose={() => setRenameDialogOpen(false)}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>フォルダの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{folderToDelete?.name}」を削除しますか？この操作は元に戻せません。
            このフォルダに含まれるすべてのメモも削除されます。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDeleteFolder} color="error">削除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolderList;
