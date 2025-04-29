import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton 
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import RenameDialog from './RenameDialog';
import { memoService } from '../services/db';

const MemoDetail = () => {
  const { memoId } = useParams();
  const navigate = useNavigate();
  const [memo, setMemo] = useState(null);
  const [content, setContent] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);
  
  const loadMemo = async () => {
    try {
      const memoData = await memoService.getById(parseInt(memoId));
      if (memoData) {
        setMemo(memoData);
        setContent(memoData.content || '');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading memo:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    if (memoId) {
      loadMemo();
    }
  }, [memoId]);

  const debouncedSave = useCallback((newContent) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeoutId = setTimeout(async () => {
      if (memo) {
        try {
          await memoService.update({ ...memo, content: newContent });
          console.log('自動保存完了');
        } catch (error) {
          console.error('Error auto-saving memo:', error);
        }
      }
    }, 1000); // 1秒間入力がなければ保存
    
    setSaveTimeout(timeoutId);
  }, [memo, saveTimeout]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleRenameMemo = async (newTitle) => {
    if (memo && newTitle.trim() !== '') {
      try {
        await memoService.update({ ...memo, title: newTitle });
        loadMemo();
      } catch (error) {
        console.error('Error renaming memo:', error);
      }
    }
  };

  if (!memo) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{memo.title}</Typography>
        <IconButton onClick={() => setRenameDialogOpen(true)}>
          <DriveFileRenameOutlineIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={10}
        value={content}
        onChange={handleContentChange}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <RenameDialog
        open={renameDialogOpen}
        title="メモのタイトル変更"
        initialValue={memo.title}
        onSave={handleRenameMemo}
        onClose={() => setRenameDialogOpen(false)}
      />
    </Box>
  );
};

export default MemoDetail;
