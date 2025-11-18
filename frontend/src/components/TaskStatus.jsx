import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const STATE_COPY = {
  PENDING: {
    label: "Pending",
    color: "#b980ff",
    description: "Waiting in Redis queue",
  },
  QUEUED: {
    label: "Queued",
    color: "#a7c7ff",
    description: "Accepted by FastAPI",
  },
  STARTED: {
    label: "Processing",
    color: "#ffb347",
    description: "Worker is crunching data",
  },
  SUCCESS: {
    label: "Completed",
    color: "#5ad07a",
    description: "Result stored in PostgreSQL",
  },
  FAILURE: {
    label: "Failed",
    color: "#ff5f5f",
    description: "See error details below",
  },
};

const POLL_INTERVAL = 3000;

const TaskStatus = ({ taskId }) => {
  const [status, setStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!taskId) return null;
    setError("");
    try {
      const res = await api.get(`/example/task/${taskId}`);
      setStatus(res.data);
      setLastUpdated(new Date());
      return res.data;
    } catch (err) {
      console.error(err);
      setError("Unable to reach the API for status updates.");
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [taskId]);

  useEffect(() => {
    setStatus(null);
    setLastUpdated(null);
    if (!taskId) return undefined;

    let intervalId;

    const poll = async () => {
      const latest = await fetchStatus();
      if (
        latest &&
        (latest.state === "SUCCESS" || latest.state === "FAILURE")
      ) {
        clearInterval(intervalId);
      }
    };

    poll();
    intervalId = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [taskId, fetchStatus]);

  const stateMeta = useMemo(() => {
    if (!status?.state) return null;
    return STATE_COPY[status.state] ?? {
      label: status.state,
      color: "#9aa7c6",
      description: status?.message,
    };
  }, [status]);

  if (!taskId) {
    return (
      <div className="status-card empty">
        <p className="eyebrow subtle">Status monitor</p>
        <h2>No task selected</h2>
        <p>Submit a task to begin polling the FastAPI status endpoint.</p>
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(taskId);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="status-card">
      <div className="status-card__header">
        <div>
          <p className="eyebrow subtle">Live status</p>
          <h2>Tracking task {taskId.slice(0, 8)}…</h2>
        </div>
        <div className="status-actions">
          <button className="ghost-btn" type="button" onClick={copyId}>
            Copy ID
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              fetchStatus();
            }}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div
        className="status-pill"
        style={{ background: stateMeta?.color ?? "#9aa7c6" }}
      >
        <span>{stateMeta?.label ?? "Fetching…"}</span>
        <p>{stateMeta?.description ?? "Polling latest state"}</p>
      </div>

      <div className="status-grid">
        <div>
          <span className="status-label">Task ID</span>
          <p className="status-value">{taskId}</p>
        </div>
        <div>
          <span className="status-label">Last updated</span>
          <p className="status-value">
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Awaiting first response"}
          </p>
        </div>
        <div>
          <span className="status-label">Message</span>
          <p className="status-value">{status?.message ?? "—"}</p>
        </div>
      </div>

      {status?.result && (
        <div className="result-block">
          <div>
            <span className="status-label">Result snapshot</span>
            <pre>{JSON.stringify(status.result, null, 2)}</pre>
          </div>
        </div>
      )}

      {(status?.error || error) && (
        <p className="form-feedback error">
          {status?.error ?? error ?? "Unknown error"}
        </p>
      )}
    </div>
  );
};

export default TaskStatus;
