import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import DriverValue from './DriverValue';
import { useDeviceReadonly } from '../util/permissions';
import { devicesActions } from '../../store';
import { useCatch } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import {
  speedFromKnots,
  speedUnitString,
  distanceFromMeters,
  distanceUnitString,
} from '../util/converter';
import { formatAddress } from '../util/formatter';
import { getFleetCategory, fleetCategory } from '../util/fleet';
import fetchOrThrow from '../util/fetchOrThrow';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    width: '100%',
    maxWidth: 760,
    padding: theme.spacing(0, 2),
    boxSizing: 'border-box',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(2)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  },
  card: {
    pointerEvents: 'auto',
    borderRadius: 14,
  },
  content: {
    padding: theme.spacing(2),
    '&:last-child': { paddingBottom: theme.spacing(2) },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  status: {
    fontWeight: 600,
    fontSize: '0.72rem',
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  body: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  tiles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1),
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  tile: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    padding: theme.spacing(1),
  },
  tileHead: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  tileIcon: {
    fontSize: '0.95rem',
  },
  tileLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tileValue: {
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  progress: {
    marginTop: theme.spacing(0.5),
    height: 6,
    borderRadius: 3,
  },
  info: {
    minWidth: 190,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
}));

const Tile = ({ label, value, percent, color, icon: Icon }) => {
  const { classes } = useStyles({ desktopPadding: 0 });
  return (
    <div className={classes.tile}>
      <div className={classes.tileHead}>
        {Icon && <Icon className={classes.tileIcon} />}
        <Typography className={classes.tileLabel}>{label}</Typography>
      </div>
      <Typography className={classes.tileValue}>{value}</Typography>
      {percent != null && (
        <LinearProgress
          className={classes.progress}
          variant="determinate"
          value={Math.max(0, Math.min(100, percent))}
          sx={{ '& .MuiLinearProgress-bar': { backgroundColor: color } }}
        />
      )}
    </div>
  );
};

const FleetStatusCard = ({ deviceId, position, onClose, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));

  const deviceReadonly = useDeviceReadonly();

  const device = useSelector((state) => state.devices.items[deviceId]);

  const speedUnit = useAttributePreference('speedUnit', 'kmh');
  const distanceUnit = useAttributePreference('distanceUnit', 'km');

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
      onClose();
    }
    setRemoving(false);
  });

  if (!device) {
    return null;
  }

  const category = fleetCategory(getFleetCategory(device, position));

  const fuel = position?.attributes?.fuel;
  const battery = position?.attributes?.batteryLevel;
  const driverUniqueId = position?.attributes?.driverUniqueId;
  const totalDistance = position?.attributes?.totalDistance;

  return (
    <>
      <div className={classes.root}>
        <Card elevation={4} className={classes.card}>
          <CardContent className={classes.content}>
            <div className={classes.header}>
              <div>
                <div className={classes.title}>
                  <span className={classes.dot} style={{ backgroundColor: category.color }}>
                    <PlaceIcon fontSize="small" />
                  </span>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {device.name}
                  </Typography>
                  <span
                    className={classes.status}
                    style={{ color: category.color, backgroundColor: `${category.color}1f` }}
                  >
                    {category.label}
                  </span>
                </div>
                {device.uniqueId && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 5 }}>
                    {device.uniqueId}
                  </Typography>
                )}
              </div>
              <div className={classes.actions}>
                {desktop ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/settings/device/${deviceId}`)}
                      disabled={deviceReadonly}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => setRemoving(true)}
                      disabled={deviceReadonly}
                    >
                      Supprimer
                    </Button>
                  </>
                ) : (
                  <>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/settings/device/${deviceId}`)}
                        disabled={deviceReadonly}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setRemoving(true)}
                        disabled={deviceReadonly}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            </div>

            <div className={classes.body}>
              <div className={classes.tiles}>
                <Tile
                  label="Vitesse"
                  icon={SpeedIcon}
                  value={
                    position != null
                      ? `${Math.round(speedFromKnots(position.speed, speedUnit))} ${speedUnitString(speedUnit, t)}`
                      : '—'
                  }
                />
                <Tile
                  label="Aujourd'hui"
                  icon={StraightenIcon}
                  value={
                    totalDistance != null
                      ? `${Math.round(distanceFromMeters(totalDistance, distanceUnit))} ${distanceUnitString(distanceUnit, t)}`
                      : '—'
                  }
                />
                <Tile
                  label="Carburant"
                  icon={LocalGasStationIcon}
                  value={fuel != null ? `${Math.round(fuel)} %` : '—'}
                  percent={fuel != null ? fuel : null}
                  color="#f59e0b"
                />
                <Tile
                  label="Batterie"
                  icon={BatteryFullIcon}
                  value={battery != null ? `${Math.round(battery)} %` : '—'}
                  percent={battery != null ? battery : null}
                  color="#16a34a"
                />
              </div>
              <div className={classes.info}>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>
                    <PersonIcon fontSize="small" /> Conducteur
                  </span>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {driverUniqueId ? <DriverValue driverUniqueId={driverUniqueId} /> : '—'}
                  </Typography>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>
                    <PlaceIcon fontSize="small" /> Position
                  </span>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 110 }}>
                    {position != null ? formatAddress(position, 'dd') : '—'}
                  </Typography>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>
                    <ScheduleIcon fontSize="small" /> Mise à jour
                  </span>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {position?.fixTime ? dayjs(position.fixTime).fromNow() : '—'}
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default FleetStatusCard;
