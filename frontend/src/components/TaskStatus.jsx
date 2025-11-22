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
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-6 w-6 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-slate-900">
          No task selected
        </h3>
        <p className="max-w-xs text-sm text-slate-500">
          Provide or submit a task ID to begin polling the FastAPI status
          endpoint.
        </p>
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Live status
          </p>
          <h2 className="text-lg font-bold text-slate-900">
            Tracking task <span className="font-mono text-slate-500">{taskId.slice(0, 8)}…</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center rounded-lg border border-transparent bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            type="button"
            onClick={copyId}
          >
            Copy ID
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              fetchStatus();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center rounded-lg border border-transparent bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isRefreshing ? (
              <svg className="mr-1.5 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div
          className="mb-8 flex items-start gap-4 rounded-xl p-4"
          style={{
            backgroundColor: `${stateMeta?.color}15`,
            borderColor: `${stateMeta?.color}30`,
            borderWidth: '1px'
          }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${stateMeta?.color}30`, color: stateMeta?.color }}
          >
            {status?.state === 'SUCCESS' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : status?.state === 'FAILURE' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="text-base font-semibold" style={{ color: stateMeta?.color }}>
              {stateMeta?.label ?? "Fetching…"}
            </h4>
            <p className="text-sm text-slate-600">
              {stateMeta?.description ?? "Polling latest state"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Task ID
            </span>
            <p className="mt-1 break-all font-mono text-sm text-slate-900">
              {taskId}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Last updated
            </span>
            <p className="mt-1 text-sm text-slate-900">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : "Awaiting first response"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Message
            </span>
            <p className="mt-1 text-sm text-slate-900">
              {status?.message ?? "—"}
            </p>
          </div>
        </div>

        {status?.result && (
          <div className="mt-8">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Result snapshot
            </span>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <pre className="overflow-x-auto p-4 text-xs text-slate-700">
                {JSON.stringify(status.result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {(status?.error || error) && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-center">
              <svg className="mr-2 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {status?.error ?? error ?? "Unknown error"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatus;
