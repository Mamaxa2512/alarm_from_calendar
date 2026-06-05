


function Filters({ onRefresh, dateValue, onDateChange, calendarValue, onCalendarChange, calendars = [] }) {
  return (
    <section className="filters">
      <div className="filter-group">
        <label htmlFor="date-filter">Date:</label>
        <input type="date" id="date-filter" value={dateValue || ''} onChange={(e) => onDateChange(e.target.value)} />
      </div>
      <div className="filter-group">
        <label htmlFor="calendar-filter">Calendar:</label>
        <select id="calendar-filter" value={calendarValue || ''} onChange={(e) => onCalendarChange(e.target.value)}>
          <option value="" >All calendars</option>
          {calendars.map((calendar) => {
            return <option key={calendar.id} value={calendar.id}>{calendar.summary}</option>
          })
          }
        </select>
      </div>
      <button onClick={onRefresh} className="btn btn-primary">
        🔄 Refresh
      </button>
    </section>
  );
}


export default Filters;

