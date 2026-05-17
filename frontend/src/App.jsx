import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Filters from './components/Filters';
import EventsList from './components/EventsList';
import SelectedEvents from './components/SelectedEvents';
import SoundSettings from './components/SoundSettings';
import AppStatus from './components/AppStatus';
import StatusMessage from './components/StatusMessage';

function getApiEvents(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
}

function normalizeEvent(raw, index) {
  const rawStart = raw?.start?.dateTime || raw?.start?.date || raw?.start || null;
  const parsedStart = rawStart ? new Date(rawStart) : null;
  const isValidDate = parsedStart && !Number.isNaN(parsedStart.getTime());
  const fallbackId = `event-${index}-${raw?.summary || 'untitled'}`;

  return {
    id: raw?.id || raw?.iCalUID || fallbackId,
    summary: raw?.summary || 'Untitled event',
    start: isValidDate ? parsedStart : null,
    isAllDay: Boolean(raw?.start?.date && !raw?.start?.dateTime),
  };
}

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [volume, setVolume] = useState(70);
  const [selectedSound, setSelectedSound] = useState('default');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [syncActive, setSyncActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [calendarFilter, setCalendarFilter] = useState(null);
  const [calendarOption, setCalendarOptions] = useState(null);


  const showMessage = useCallback((message, type = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to load events');

      const payload = await response.json();
      const normalized = getApiEvents(payload).map((event, index) => normalizeEvent(event, index));

      setEvents(normalized);
      showMessage('Events loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading events:', error);
      showMessage('Failed to load events', 'error');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      setConnectionStatus(response.ok ? 'ok' : 'error');
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
    }
  }, []);

  // Завантажити события
  useEffect(() => {
    loadEvents();
    checkConnection();
  }, [loadEvents, checkConnection]);

  const toggleEventSelection = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const removeSelectedEvent = (eventId) => {
    setSelectedEvents((prev) => prev.filter((id) => id !== eventId));
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/alarm-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alarmEvents: selectedEvents,
          volume,
          sound: selectedSound,
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      showMessage('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Failed to save settings', 'error');
    }
  };

  const clearAllEvents = () => {
    setSelectedEvents([]);
    showMessage('All events cleared', 'info');
  };


  const startSync = () => {
    setSyncActive(true);
    showMessage('Synchronization started', 'success');
    setLastUpdate(new Date());
  };

  const stopSync = () => {
    setSyncActive(false);
    showMessage('Synchronization stopped', 'info');
  };

  const testSound = async () => {
    try {
      const response = await fetch('/api/test-sound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sound: selectedSound, volume }),
      });

      if (!response.ok) throw new Error('Failed to play sound');
      showMessage('Playing test sound...', 'info');
    } catch (error) {
      console.error('Error playing sound:', error);
      showMessage('Failed to play sound', 'error');
    }
  };

  const selectedEventsList = events.filter((event) => selectedEvents.includes(event.id));

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        {statusMessage && (
          <StatusMessage message={statusMessage.message} type={statusMessage.type} />
        )}

        <Filters onRefresh={loadEvents} />

        <EventsList
          events={events}
          selectedEvents={selectedEvents}
          loading={loading}
          onToggle={toggleEventSelection}
        />

        <SelectedEvents
          events={selectedEventsList}
          selectedCount={selectedEvents.length}
          onRemove={removeSelectedEvent}
          onSave={saveSettings}
          onClear={clearAllEvents}
        />

        <SoundSettings
          volume={volume}
          onVolumeChange={setVolume}
          selectedSound={selectedSound}
          onSoundChange={setSelectedSound}
          onTestSound={testSound}
        />

        <AppStatus
          syncActive={syncActive}
          connectionStatus={connectionStatus}
          lastUpdate={lastUpdate}
          onStartSync={startSync}
          onStopSync={stopSync}
        />
      </main>
    </div>
  );
}

export default App;
