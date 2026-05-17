

function formatEventDate(event) {
  if (!event.start) return 'Date is not available';
  return event.start.toLocaleDateString();
}

function formatEventTime(event) {
  if (!event.start) return event.isAllDay ? 'All day' : 'Time is not available';
  if (event.isAllDay) return 'All day';
  return event.start.toLocaleTimeString();
}

function EventsList({ events, selectedEvents, loading, onToggle }) {
  if (loading) {
    return (
      <section className="events-section">
        <h2>Events</h2>
        <div className="events-list">
          <div className="loading">Loading events...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="events-section">
      <h2>Events</h2>
      <div className="events-list">
        {events.length === 0 ? (
          <div className="loading">No events found</div>
        ) : (
          events.map((event) => {
            const isSelected = selectedEvents.includes(event.id);

            return (
              <div
                key={event.id}
                className={`event-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggle(event.id)}
              >
                <input
                  type="checkbox"
                  className="event-checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(event.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="event-details">
                  <div className="event-title">{event.summary}</div>
                  <div className="event-time">
                    <span>📅 {formatEventDate(event)}</span>
                    <span>🕐 {formatEventTime(event)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default EventsList;
