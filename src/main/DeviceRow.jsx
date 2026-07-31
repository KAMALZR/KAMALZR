import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { ListItemButton, ListItemText, Typography, Box } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import PlaceIcon from '@mui/icons-material/Place';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import { formatAddress } from '../common/util/formatter';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import { getFleetCategory, fleetCategory } from '../common/util/fleet';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  button: {
    gap: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: '3px solid transparent',
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
  },
  selected: {
    backgroundColor: `${theme.palette.primary.main}14`,
    borderLeftColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}1f`,
    },
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
    flexGrow: 1,
  },
  topLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  statusPill: {
    fontWeight: 600,
    fontSize: '0.68rem',
    flexShrink: 0,
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    minWidth: 0,
  },
  metaIcon: {
    fontSize: '0.95rem',
    flexShrink: 0,
  },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const speedUnit = useAttributePreference('speedUnit', 'kmh');

  const category = fleetCategory(getFleetCategory(item, position));

  const speedText =
    position != null
      ? `${Math.round(speedFromKnots(position.speed, speedUnit))} ${speedUnitString(speedUnit, t)}`
      : null;

  const locationText = position != null ? formatAddress(position, 'dd') : null;

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={
          selectedDeviceId === item.id ? `${classes.button} ${classes.selected}` : classes.button
        }
      >
        <span className={classes.statusDot} style={{ backgroundColor: category.color }} />
        <ListItemText
          disableTypography
          primary={
            <div className={classes.row}>
              <div className={classes.topLine}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
                <span
                  className={classes.statusPill}
                  style={{ color: category.color, backgroundColor: `${category.color}1f` }}
                >
                  {category.label}
                </span>
              </div>
              <div className={classes.meta}>
                {speedText != null && (
                  <>
                    <SpeedIcon className={classes.metaIcon} />
                    <Typography variant="caption">{speedText}</Typography>
                  </>
                )}
                {locationText && (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <PlaceIcon className={classes.metaIcon} sx={{ ml: speedText ? 1 : 0 }} />
                    <Typography variant="caption" noWrap>
                      {locationText}
                    </Typography>
                  </Box>
                )}
                {!position && (
                  <Typography variant="caption">
                    {item.lastUpdate ? dayjs(item.lastUpdate).fromNow() : t('deviceStatusUnknown')}
                  </Typography>
                )}
              </div>
            </div>
          }
        />
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
