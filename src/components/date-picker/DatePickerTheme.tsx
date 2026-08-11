import {createTheme, ThemeProvider} from '@mui/material';
import {useSelector} from 'react-redux';
import {RootState} from '../../lib/store/reducers';

interface DatePickerThemeProps {
  children: React.ReactNode;
}

export const DatePickerTheme = ({children}: DatePickerThemeProps) => {
  const themeMode = useSelector<RootState, 'dark' | 'light'>((state) => {
    return state.theme.dark ? 'dark' : 'light';
  });

  const localDarkTheme = createTheme({
    cssVariables: {
      nativeColor: true,
    },
    palette: {
      mode: themeMode,
      primary: {
        main:
          themeMode === 'dark' ? 'var(--ion-color-primary-contrast)' : 'var(--ion-color-primary)',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: 'var(--ion-text-color)',
          },
        },
      },
    },
  });

  return <ThemeProvider theme={localDarkTheme}>{children}</ThemeProvider>;
};
