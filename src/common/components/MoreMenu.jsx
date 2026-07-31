import { useNavigate } from 'react-router-dom';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import DrawIcon from '@mui/icons-material/Draw';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import BuildIcon from '@mui/icons-material/Build';
import SendIcon from '@mui/icons-material/Send';
import TodayIcon from '@mui/icons-material/Today';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DescriptionIcon from '@mui/icons-material/Description';

const useStyles = makeStyles()((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2, 0.5, 2),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2, 3, 2),
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 0.5),
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
  },
  label: {
    fontSize: '0.72rem',
    lineHeight: 1.1,
    color: theme.palette.text.secondary,
  },
}));

const items = [
  { label: 'Géofences', icon: <DrawIcon />, to: '/geofences' },
  { label: 'Conducteurs', icon: <PersonIcon />, to: '/settings/drivers' },
  { label: 'Groupes', icon: <FolderIcon />, to: '/settings/groups' },
  { label: 'Maintenance', icon: <BuildIcon />, to: '/settings/maintenances' },
  { label: 'Commandes', icon: <SendIcon />, to: '/settings/commands' },
  { label: 'Calendriers', icon: <TodayIcon />, to: '/settings/calendars' },
  { label: 'Notifications', icon: <NotificationsIcon />, to: '/settings/notifications' },
  { label: 'Rapports', icon: <DescriptionIcon />, to: '/reports/summary' },
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
        <Typography variant="subtitle1" fontWeight={700}>
          Plus
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      <Box className={classes.grid}>
        {items.map((item) => (
          <div key={item.label} className={classes.item} onClick={() => handleClick(item.to)}>
            <div className={classes.iconBox}>{item.icon}</div>
            <span className={classes.label}>{item.label}</span>
          </div>
        ))}
      </Box>
    </Drawer>
  );
};

export default MoreMenu;
