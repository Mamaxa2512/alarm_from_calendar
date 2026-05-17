function SoundSettings({
  volume,
  onVolumeChange,
  selectedSound,
  onSoundChange,
  onTestSound,
}) {
  return (
    <section className="sound-settings">
      <h2>Sound Settings</h2>
      <div className="sound-group">
        <label htmlFor="sound-select">Select alarm sound:</label>
        <select
          id="sound-select"
          value={selectedSound}
          onChange={(e) => onSoundChange(e.target.value)}
        >
          <option value="default">Default sound</option>
          <option value="Skillet_Monster">Skillet Monster</option>
        </select>
      </div>
      <div className="sound-group">
        <label htmlFor="volume-control">Volume:</label>
        <div className="volume-container">
          <input
            type="range"
            id="volume-control"
            className="volume-control"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          />
          <span className="volume-value">{volume}%</span>
        </div>
      </div>
      <button onClick={onTestSound} className="btn btn-secondary">
        🔊 Test Sound
      </button>
    </section>
  );
}

export default SoundSettings;

