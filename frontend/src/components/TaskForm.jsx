import { useMemo, useState } from "react";
import api from "../services/api";

const INITIAL_FORM = {
  userId: "101",
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
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="eyebrow subtle">Submit workload</p>
          <h2>Prepare background task payload</h2>
        </div>
        <p>Matches the FastAPI schema powering your production worker queue.</p>
      </div>

      <div className="field-group">
        <label htmlFor="userId">User ID</label>
        <input
          id="userId"
          type="number"
          placeholder="e.g. 101"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="items">Items</label>
        <input
          id="items"
          type="text"
          placeholder="Comma separated e.g. 12, 44, 87"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          required
        />
        <small>We convert these into an integer array for processing.</small>
      </div>

      <div className="field-group">
        <label htmlFor="note">Note</label>
        <textarea
          id="note"
          rows={3}
          placeholder="Business context sent to workers"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="form-footer">
        <button
          type="button"
          className="ghost-btn"
          onClick={handlePrefill}
          disabled={isSubmitting}
        >
          Prefill sample payload
        </button>
        <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Queueing…" : "Queue Task"}
        </button>
      </div>

      {feedback.message && (
        <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p>
      )}
    </form>
  );
};

export default TaskForm;
