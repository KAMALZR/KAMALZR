import { lazy, Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import TopMenu from '../common/components/TopMenu';
import FleetToolbar from './FleetToolbar';
import FleetStatusCard from '../common/components/FleetStatusCard';
import { devicesActions } from '../store';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import { useAttributePreference } from '../common/util/preferences';
import { getFleetCategory } from '../common/util/fleet';

const MainMap = lazy(() => import('./MainMap'));

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
    display: 'flex',
  },
  leftPanel: {
    width: theme.dimensions.drawerWidthDesktop,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    zIndex: 4,
  },
  deviceListWrap: {
    flex: 1,
    minHeight: 0,
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
  },
  // Mobile: full-screen vehicle panel overlaying the map
  mobileList: {
    position: 'absolute',
    inset: 0,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
  },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const filter = useMemo(() => ({ statuses: [], groups: [], geofences: [] }), []);
  const filterSort = '';
  const filterMap = false;

  const [devicesOpen, setDevicesOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  const displayedDevices = useMemo(() => {
    if (!categoryFilter) {
      return filteredDevices;
    }
    return filteredDevices.filter(
      (device) => getFleetCategory(device, positions[device.id]) === categoryFilter,
    );
  }, [filteredDevices, categoryFilter, positions]);

  const statusCard = selectedDeviceId && (
    <FleetStatusCard
      deviceId={selectedDeviceId}
      position={selectedPosition}
      onClose={() => dispatch(devicesActions.selectId(null))}
      desktopPadding={theme.dimensions.drawerWidthDesktop}
    />
  );

  if (desktop) {
    return (
      <div className={classes.root}>
        <TopMenu onAlertsClick={onEventsClick} />
        <div className={classes.content}>
          <div className={classes.leftPanel}>
            <FleetToolbar
              keyword={keyword}
              setKeyword={setKeyword}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
            <div className={classes.deviceListWrap}>
              <DeviceList devices={displayedDevices} />
            </div>
          </div>
          <div className={classes.mapWrap}>
            <Suspense fallback={null}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
                disablePadding
              />
            </Suspense>
          </div>
        </div>
        <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
        {statusCard}
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <TopMenu
        onAlertsClick={onEventsClick}
        onToggleList={() => setDevicesOpen((open) => !open)}
        listOpen={devicesOpen}
      />
      <div className={classes.content}>
        <div className={classes.mapWrap}>
          <Suspense fallback={null}>
            <MainMap
              filteredPositions={filteredPositions}
              selectedPosition={selectedPosition}
              onEventsClick={onEventsClick}
            />
          </Suspense>
        </div>
        {devicesOpen && (
          <Paper square elevation={0} className={classes.mobileList}>
            <FleetToolbar
              keyword={keyword}
              setKeyword={setKeyword}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
            <div className={classes.deviceListWrap}>
              <DeviceList devices={displayedDevices} />
            </div>
          </Paper>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {!devicesOpen && statusCard}
    </div>
  );
};

export default MainPage;
