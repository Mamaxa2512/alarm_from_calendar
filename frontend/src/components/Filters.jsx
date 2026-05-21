


function Filters({ onRefresh, dateValue, onDateChange, calendarValue, onCalendarChange }) {
  return (
    <section className="filters">
      <div className="filter-group">
        <label htmlFor="date-filter">Date:</label>
        <input type="date" id="date-filter" value={dateValue || ''} onChange={(e) => onDateChange(e.target.value)} />
      </div>
      <div className="filter-group">
        <label htmlFor="calendar-filter">Calendar:</label>
        <select id="calendar-filter">
          <option value="">All calendars</option>
        </select>
      </div>
      <button onClick={onRefresh} className="btn btn-primary">
        🔄 Refresh
      </button>
    </section>
  );
}

export default Filters;

