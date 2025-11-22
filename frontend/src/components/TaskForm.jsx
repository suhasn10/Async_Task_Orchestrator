import { useMemo, useState } from "react";
import api from "../services/api";

const INITIAL_FORM = {
  userId: "001",
  items: "42, 78, 134, 209",
  note: "Quarterly usage reconciliation",
};

const TaskForm = ({ onTaskCreated }) => {
  const [userId, setUserId] = useState(INITIAL_FORM.userId);
  const [items, setItems] = useState(INITIAL_FORM.items);
  const [note, setNote] = useState(INITIAL_FORM.note);
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedItems = useMemo(() => {
    return items
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));
  }, [items]);

  const canSubmit = userId && parsedItems.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setFeedback({
      type: "info",
      message: "Queueing task via FastAPI…",
    });

    const payload = {
      data: {
        user_id: Number(userId),
        items: parsedItems,
        note,
      },
    };

    try {
      const res = await api.post("/example/process-data", payload);
      onTaskCreated(res.data.task_id);
      setFeedback({
        type: "success",
        message: `Task ${res.data.task_id} queued successfully.`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message:
          err?.response?.data?.detail ?? "Failed to queue the task. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrefill = () => {
    setUserId(INITIAL_FORM.userId);
    setItems(INITIAL_FORM.items);
    setNote(INITIAL_FORM.note);
    setFeedback({ type: "info", message: "Sample payload restored." });
  };

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="mb-8">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Submit workload
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Prepare background task
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Matches the FastAPI schema powering your production worker queue.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="userId"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            User ID
          </label>
          <input
            id="userId"
            type="number"
            placeholder="e.g. 101"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="items"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Items
          </label>
          <input
            id="items"
            type="text"
            placeholder="Comma separated e.g. 12, 44, 87"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            required
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <small className="mt-1 block text-xs text-slate-500">
            We convert these into an integer array for processing.
          </small>
        </div>

        <div>
          <label
            htmlFor="note"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Note
          </label>
          <textarea
            id="note"
            rows={3}
            placeholder="Business context sent to workers"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Queueing…
            </>
          ) : (
            "Queue Task"
          )}
        </button>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          onClick={handlePrefill}
          disabled={isSubmitting}
        >
          Prefill sample
        </button>
      </div>

      {feedback.message && (
        <div
          className={`mt-6 rounded-lg p-4 text-sm ${feedback.type === "error"
            ? "bg-red-50 text-red-800"
            : feedback.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-blue-50 text-blue-800"
            }`}
        >
          <div className="flex items-center">
            {feedback.type === 'success' && (
              <svg className="mr-2 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {feedback.message}
          </div>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
