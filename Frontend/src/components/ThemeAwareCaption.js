import React from 'react';
import { Typography, useTheme } from '@mui/material';
import { ThemeContext } from './AppThemeProvider';
import { useContext } from 'react';

/**
 * ThemeAwareCaption - A wrapper component that provides theme-aware caption styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - The caption variant ('primary', 'secondary', 'tertiary', 'disabled', 'meta', 'timestamp')
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} props.sx - Additional Material-UI sx styles
 * @param {Object} props.rest - Any other props to pass to Typography
 */
const ThemeAwareCaption = ({ 
  variant = 'secondary', 
  children, 
  sx = {}, 
  ...rest 
}) => {
  const theme = useTheme();
  const { appearance } = useContext(ThemeContext);

  // Define caption styles based on variant and theme
  const getCaptionStyles = () => {
    const baseStyles = {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.2,
      fontWeight: 400,
      letterSpacing: '0.025em',
    };

    const variantStyles = {
      primary: {
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
      secondary: {
        color: theme.palette.text.secondary,
      },
      tertiary: {
        color: theme.palette.text.secondary,
        opacity: 0.8,
      },
      disabled: {
        color: theme.palette.text.disabled || theme.palette.text.secondary,
        opacity: 0.6,
      },
      meta: {
        color: theme.palette.text.secondary,
        opacity: 0.7,
      },
      timestamp: {
        color: theme.palette.text.secondary,
        opacity: 0.7,
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
    };
  };

  return (
    <Typography
      variant="caption"
      sx={{
        ...getCaptionStyles(),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
};

export default ThemeAwareCaption;
