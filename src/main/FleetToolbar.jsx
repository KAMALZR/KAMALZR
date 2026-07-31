import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, OutlinedInput, InputAdornment } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useDeviceReadonly } from '../common/util/permissions';
import { fleetCategories, getFleetCategory } from '../common/util/fleet';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
  },
  addButton: {
    textTransform: 'none',
    fontWeight: 600,
  },
  chips: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1),
  },
  chip: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 1.25),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    userSelect: 'none',
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  chipTop: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    flexShrink: 0,
  },
  chipLabel: {
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
  },
  chipCount: {
    fontWeight: 700,
    fontSize: '1.35rem',
    lineHeight: 1,
  },
}));

const FleetToolbar = ({ keyword, setKeyword, categoryFilter, setCategoryFilter }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const deviceReadonly = useDeviceReadonly();

  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);

  const counts = useMemo(() => {
    const result = { moving: 0, idle: 0, stopped: 0, offline: 0 };
    Object.values(devices).forEach((device) => {
      result[getFleetCategory(device, positions[device.id])] += 1;
    });
    return result;
  }, [devices, positions]);

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<AddIcon />}
        className={classes.addButton}
        onClick={() => navigate('/settings/device')}
        disabled={deviceReadonly}
      >
        Ajouter un véhicule
      </Button>
      <OutlinedInput
        placeholder="Rechercher un véhicule, plaque..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        }
        size="small"
        fullWidth
        sx={{ borderRadius: 2.5 }}
      />
      <div className={classes.chips}>
        {fleetCategories.map((category) => {
          const active = categoryFilter === category.key;
          return (
            <div
              key={category.key}
              className={classes.chip}
              style={
                active
                  ? { backgroundColor: `${category.color}14`, borderColor: category.color }
                  : undefined
              }
              onClick={() => setCategoryFilter(active ? null : category.key)}
            >
              <div className={classes.chipTop}>
                <span className={classes.dot} style={{ backgroundColor: category.color }} />
                <span
                  className={classes.chipLabel}
                  style={active ? { color: category.color, fontWeight: 600 } : undefined}
                >
                  {category.label}
                </span>
              </div>
              <span className={classes.chipCount} style={{ color: category.color }}>
                {counts[category.key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetToolbar;
