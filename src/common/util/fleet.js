// FleetTrack status categories derived from Traccar device status + last position.
// Labels are intentionally in French to match the FleetTrack interface design.

export const fleetCategories = [
  { key: 'moving', label: 'En route', color: '#16a34a' },
  { key: 'idle', label: 'Au ralenti', color: '#f59e0b' },
  { key: 'stopped', label: 'Arrêté', color: '#2563eb' },
  { key: 'offline', label: 'Hors ligne', color: '#9ca3af' },
];

export const getFleetCategory = (device, position) => {
  if (!device || device.status !== 'online') {
    return 'offline';
  }
  const speed = position?.speed || 0;
  const motion = position?.attributes?.motion;
  const ignition = position?.attributes?.ignition;
  if (motion || speed > 1) {
    return 'moving';
  }
  if (ignition) {
    return 'idle';
  }
  return 'stopped';
};

export const fleetCategory = (key) => fleetCategories.find((c) => c.key === key);
