import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from 'lucide-react/dist/esm/icons/x';
import { useSearch } from '../contexts/SearchContext'; // ⭐ Import useSearch context

const SearchBar = ({ placeholder = 'Search books...' }) => {
  const { setSearchTerm } = useSearch(); // ⭐ Get the setSearchTerm function from the context
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const theme = useTheme();

  const handleInputChange = (event) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    // ⭐ Update the global search context state
    setSearchTerm(localSearchTerm.trim());
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setSearchTerm(''); // ⭐ Clear search results in global state
  };

  return (
    <Paper
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: { xs: '100%', sm: 300, md: 400 },
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.1)' 
          : 'rgba(0,0,0,0.05)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <TextField
        sx={{
          ml: 1,
          flex: 1,
          input: { 
            color: theme.palette.primary.contrastText 
          },
          '& .MuiInputBase-input::placeholder': { 
            color: theme.palette.primary.contrastText, 
            opacity: 0.7 
          },
          '& .MuiInput-underline:before': { 
            borderBottomColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.4)' 
              : 'rgba(0,0,0,0.2)' 
          },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
            borderBottomColor: theme.palette.primary.contrastText 
          },
          '& .MuiInput-underline:after': { 
            borderBottomColor: 'primary.main' 
          },
        }}
        placeholder={placeholder}
        inputProps={{ 'aria-label': placeholder }}
        variant="standard"
        value={localSearchTerm}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          disableUnderline: true,
          endAdornment: (
            <InputAdornment position="end">
              {localSearchTerm && (
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
      <IconButton
        sx={{ p: '10px', color: theme.palette.primary.contrastText }}
        aria-label="search"
        onClick={handleSearch}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;