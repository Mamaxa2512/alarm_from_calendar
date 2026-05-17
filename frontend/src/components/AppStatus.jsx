function AppStatus({
  syncActive,
  connectionStatus,
  lastUpdate,
  onStartSync,
  onStopSync,
}) {
  const getConnectionBadge = () => {
    if (connectionStatus === 'ok') {
      return <span className="status-badge status-success">✅ Connected</span>;
    } else if (connectionStatus === 'error') {
      return <span className="status-badge status-error">❌ Disconnected</span>;
    }
    return <span className="status-badge status-idle">🔌 Checking...</span>;
  };

  const getSyncBadge = () => {
    if (syncActive) {
      return <span className="status-badge status-active">✅ Active</span>;
    }
    return <span className="status-badge status-idle">⏸️ Inactive</span>;
  };

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  return (
    <section className="app-status">
      <h2>Application Status</h2>
      <div className="status-info">
        <div className="status-item">
          <span className="label">Synchronization:</span>
          {getSyncBadge()}
        </div>
        <div className="status-item">
          <span className="label">Connection:</span>
          {getConnectionBadge()}
        </div>
        <div className="status-item">
          <span className="label">Last update:</span>
          <span className="last-update">{formatTime(lastUpdate)}</span>
        </div>
      </div>
      <div className="actions">
        <button
          onClick={onStartSync}
          disabled={syncActive}
          className="btn btn-primary"
        >
          ▶️ Start synchronization
        </button>
        <button
          onClick={onStopSync}
          disabled={!syncActive}
          className="btn btn-warning"
        >
          ⏹️ Stop synchronization
        </button>
      </div>
    </section>
  );
}

export default AppStatus;

