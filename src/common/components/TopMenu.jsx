import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RouteIcon from '@mui/icons-material/Route';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigationIcon from '@mui/icons-material/Navigation';
import MapIcon from '@mui/icons-material/Map';
import ListAltIcon from '@mui/icons-material/ListAlt';

import { sessionActions } from '../../store';
import { nativePostMessage } from './NativeInterface';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 2,
  },
  toolbar: {
    gap: theme.spacing(1),
    minHeight: 60,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexGrow: 1,
  },
  navButton: {
    textTransform: 'none',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
  },
  spacer: {
    flexGrow: 1,
  },
}));

const TopMenu = ({ onAlertsClick, onToggleList, listOpen }) => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.session.user);
  const eventsCount = useSelector((state) => state.events.items.length);

  const [anchorEl, setAnchorEl] = useState(null);

  const isMap = location.pathname === '/';
  const isReports = location.pathname.startsWith('/reports');
  const isSettings = location.pathname.startsWith('/settings');

  const handleAlerts = () => {
    if (onAlertsClick) {
      onAlertsClick();
    } else {
      navigate('/reports/events');
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {!desktop && onToggleList && (
          <IconButton edge="start" onClick={onToggleList}>
            {listOpen ? <MapIcon /> : <ListAltIcon />}
          </IconButton>
        )}
        <div className={classes.brand}>
          <div className={classes.brandIcon}>
            <NavigationIcon fontSize="small" />
          </div>
          <Typography variant="h6" className={classes.brandText}>
            FleetTrack
          </Typography>
        </div>
        {desktop && (
          <Box className={classes.nav}>
            <Button
              className={cx(classes.navButton, isMap && classes.navButtonActive)}
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/')}
            >
              Tableau de bord
            </Button>
            <Button
              className={cx(classes.navButton, isReports && classes.navButtonActive)}
              startIcon={<RouteIcon />}
              onClick={() => navigate('/reports/combined')}
            >
              Trajets
            </Button>
            <Button
              className={classes.navButton}
              startIcon={<NotificationsIcon />}
              onClick={handleAlerts}
            >
              Alertes
            </Button>
            <Button
              className={cx(classes.navButton, isSettings && classes.navButtonActive)}
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/settings/preferences')}
            >
              Réglages
            </Button>
          </Box>
        )}
        <div className={classes.spacer} />
        <Tooltip title="Alertes">
          <IconButton onClick={handleAlerts}>
            <Badge color="error" badgeContent={eventsCount} max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title={user?.name || ''}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 34, height: 34 }}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleAccount}>
            <Typography color="textPrimary">Mon compte</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Typography color="error">Déconnexion</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopMenu;
