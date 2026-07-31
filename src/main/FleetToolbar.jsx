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
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  chip: {
    flex: '1 1 45%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    fontSize: '0.8rem',
    userSelect: 'none',
  },
  chipActive: {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main} inset`,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  chipLabel: {
    flexGrow: 1,
    color: theme.palette.text.secondary,
  },
  chipCount: {
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
}));

const FleetToolbar = ({ keyword, setKeyword, categoryFilter, setCategoryFilter }) => {
  const { classes, cx } = useStyles();
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
      />
      <div className={classes.chips}>
        {fleetCategories.map((category) => (
          <div
            key={category.key}
            className={cx(classes.chip, categoryFilter === category.key && classes.chipActive)}
            onClick={() => setCategoryFilter(categoryFilter === category.key ? null : category.key)}
          >
            <span className={classes.dot} style={{ backgroundColor: category.color }} />
            <span className={classes.chipLabel}>{category.label}</span>
            <span className={classes.chipCount}>{counts[category.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetToolbar;
