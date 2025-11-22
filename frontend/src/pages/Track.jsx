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
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Manual lookup
          </p>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Track an existing task
          </h2>
          <p className="text-slate-600">
            Paste any task Id issued by the FastAPI gateway to inspect its status
            on demand. The lookup makes a direct call to the task status
            endpoint so operators can audit execution without re‑queueing work.
          </p>
        </div>

        <form className="flex gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task ID (e.g. 550e8400-e29b...)"
            value={taskIdInput}
            onChange={(e) => setTaskIdInput(e.target.value)}
            className="block w-full flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
          >
            Fetch status
          </button>
        </form>

        {taskId && (
          <p className="mt-4 text-sm text-slate-500">
            Currently tracking <strong className="font-mono text-slate-900">{taskId}</strong>
          </p>
        )}
      </section>

      <section>
        <TaskStatus taskId={taskId} />
      </section>
    </div>
  );
};

export default Track;

