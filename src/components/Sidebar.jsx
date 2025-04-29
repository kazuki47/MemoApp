import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemButton, ListItemText, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SettingsIcon from '@mui/icons-material/Settings';
import '../assets/playlist-script.css'; // フォントCSSをインポート

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box sx={{ 
      width: 240, 
      flexShrink: 0, 
      backgroundColor: '#f5f5f5', 
      height: '100vh',
      borderRight: '1px solid #e0e0e0' 
    }}>
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mt: 1,
            mb: 2, 
            fontSize: '2.2rem', // フォントサイズを大きく設定
            fontFamily: '"playlist-script", cursive',
            textAlign: 'center'
          }}
        >
          MemoShed
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/folders"
            selected={location.pathname === '/folders'} 
          >
            <ListItemIcon>
              <EditNoteIcon />
            </ListItemIcon>
            <ListItemText primary="フォルダ一覧" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/settings" 
            selected={location.pathname === '/settings'}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="設定" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
