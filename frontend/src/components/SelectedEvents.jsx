function formatSelectedDate(event) {
  if (!event.start) return 'Date/time is not available';
  if (event.isAllDay) return `${event.start.toLocaleDateString()} (all day)`;
  return event.start.toLocaleString();
}

function SelectedEvents({ events, selectedCount, onRemove, onSave, onClear }) {
  return (
    <section className="selected-section">
      <h2>Selected events for alarm ({selectedCount})</h2>
      <div className="selected-events-list">
        {events.length === 0 ? (
          <p className="empty-message">No events selected</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="selected-event">
              <div>
                <div className="selected-event-title">{event.summary}</div>
                <div className="selected-event-time">
                  {formatSelectedDate(event)}
                </div>
              </div>
              <button
                className="remove-btn"
                onClick={() => onRemove(event.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <div className="actions">
        <button
          className="btn btn-success"
          onClick={onSave}
          disabled={selectedCount === 0}
        >
          💾 Save
        </button>
        <button
          className="btn btn-danger"
          onClick={onClear}
          disabled={selectedCount === 0}
        >
          🗑️ Clear all
        </button>
      </div>
    </section>
  );
}

export default SelectedEvents;
