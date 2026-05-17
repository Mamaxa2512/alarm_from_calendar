function StatusMessage({ message, type }) {
  return (
    <div className={`status-message show ${type}`}>
      {message}
    </div>
  );
}

export default StatusMessage;

