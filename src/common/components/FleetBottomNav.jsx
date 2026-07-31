import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RouteIcon from '@mui/icons-material/Route';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

const FleetBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const eventsCount = useSelector((state) => state.events.items.length);

  const currentSelection = () => {
    if (location.pathname.startsWith('/reports/events')) {
      return 'alerts';
    }
    if (location.pathname.startsWith('/reports')) {
      return 'reports';
    }
    if (location.pathname.startsWith('/settings')) {
      return 'settings';
    }
    if (location.pathname === '/') {
      return 'map';
    }
    return null;
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports':
        navigate('/reports/combined');
        break;
      case 'alerts':
        navigate('/reports/events');
        break;
      case 'settings':
        navigate('/settings/preferences');
        break;
      default:
        break;
    }
  };

  return (
    <Paper square elevation={3}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
        <BottomNavigationAction label="Tableau de bord" icon={<DashboardIcon />} value="map" />
        <BottomNavigationAction label="Trajets" icon={<RouteIcon />} value="reports" />
        <BottomNavigationAction
          label="Alertes"
          icon={
            <Badge color="error" badgeContent={eventsCount} max={99}>
              <NotificationsIcon />
            </Badge>
          }
          value="alerts"
        />
        <BottomNavigationAction label="Réglages" icon={<SettingsIcon />} value="settings" />
      </BottomNavigation>
    </Paper>
  );
};

export default FleetBottomNav;
