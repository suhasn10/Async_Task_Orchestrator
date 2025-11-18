import { useState } from "react";
import TaskStatus from "../components/TaskStatus";

const Track = () => {
  const [taskIdInput, setTaskIdInput] = useState("");
  const [taskId, setTaskId] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!taskIdInput.trim()) return;
    setTaskId(taskIdInput.trim());
  };

  return (
    <div className="track-page">
      <section className="panel lookup-panel">
        <p className="eyebrow subtle">Manual lookup</p>
        <h2>Track an existing task</h2>
        <p>
          Paste any task Id issued by the FastAPI gateway to inspect its status on demand. The lookup makes a direct call to the task status endpoint so operators can audit execution without re‑queueing work.
        </p>

        <form className="lookup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task ID"
            value={taskIdInput}
            onChange={(e) => setTaskIdInput(e.target.value)}
          />
          <button type="submit">Fetch status</button>
        </form>

        {taskId && (
          <p className="lookup-hint">
            Currently tracking <strong>{taskId}</strong>
          </p>
        )}
      </section>

      <section className="panel status-panel">
        <TaskStatus taskId={taskId} />
      </section>
    </div>
  );
};

export default Track;

