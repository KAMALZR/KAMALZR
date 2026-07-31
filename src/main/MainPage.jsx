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
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
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
  // Mobile layout (unchanged Traccar behaviour)
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
  },
  middle: {
    flex: 1,
    display: 'grid',
    minHeight: 0,
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
    display: 'flex',
    minHeight: 0,
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
  const [filter, setFilter] = usePersistedState('deviceFilter', {
    statuses: [],
    groups: [],
    geofences: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
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
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>
        <div className={classes.middle}>
          <div className={classes.contentMap}>
            <Suspense fallback={null}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </Suspense>
          </div>
          <Paper
            square
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: 'hidden' }}
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {statusCard}
    </div>
  );
};

export default MainPage;
