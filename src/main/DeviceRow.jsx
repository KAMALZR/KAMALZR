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
  selected: {
    backgroundColor: theme.palette.action.selected,
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    minWidth: 0,
  },
  topLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  status: {
    fontWeight: 600,
    fontSize: '0.75rem',
    flexShrink: 0,
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
        className={selectedDeviceId === item.id ? classes.selected : null}
      >
        <ListItemText
          disableTypography
          primary={
            <div className={classes.row}>
              <div className={classes.topLine}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
                <span className={classes.status} style={{ color: category.color }}>
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
