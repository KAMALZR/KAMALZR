import { useNavigate } from 'react-router-dom';
import { Drawer, Typography, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const useStyles = makeStyles()((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 1, 2),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2, 3, 2),
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 1),
    minHeight: 96,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: '0.82rem',
    lineHeight: 1.15,
  },
}));

const items = [
  { label: 'Groupes', icon: WorkspacesOutlinedIcon, to: '/settings/groups' },
  { label: 'Zones', icon: CategoryOutlinedIcon, to: '/geofences' },
  { label: 'Rejeu', icon: MovieOutlinedIcon, to: '/replay' },
  { label: 'Rapports', icon: BarChartOutlinedIcon, to: '/reports/combined' },
  { label: 'Conducteurs', icon: PersonOutlineOutlinedIcon, to: '/settings/drivers' },
  { label: 'Entretien', icon: BuildOutlinedIcon, to: '/settings/maintenances' },
  { label: 'Commandes', icon: SensorsOutlinedIcon, to: '/settings/commands' },
  { label: 'Notifications', icon: NotificationsNoneOutlinedIcon, to: '/settings/notifications' },
  { label: 'Calendriers', icon: CalendarMonthOutlinedIcon, to: '/settings/calendars' },
  { label: 'Attributs calculés', icon: FunctionsOutlinedIcon, to: '/settings/attributes' },
  { label: 'Réglages', icon: SettingsOutlinedIcon, to: '/settings/preferences' },
];

const MoreMenu = ({ open, onClose }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const handleClick = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16 } } }}
    >
      <div className={classes.header}>
        <Typography variant="h6" fontWeight={700}>
          Plus d&apos;options
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.grid}>
        {items.map(({ label, icon: Icon, to }) => (
          <div key={label} className={classes.item} onClick={() => handleClick(to)}>
            <Icon className={classes.icon} />
            <span className={classes.label}>{label}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
};

export default MoreMenu;
