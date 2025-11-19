import { useMemo, useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskStatus from "../components/TaskStatus";

const FLOW_STEPS = [
  {
    title: "Client / API Consumer",
    description:
      "Submits structured payloads (user id, item list, notes) to kick off async work.",
    action: "POST request with business data",
  },
  {
    title: "FastAPI Gateway",
    description:
      "Validates input, persists an initial record, and enqueues the Celery task.",
    action: "POST /example/process-data",
  },
  {
    title: "Redis Broker",
    description:
      "Acts as the message backbone, holding tasks until a Celery worker is free.",
    action: "Brokered queue",
  },
  {
    title: "Celery Workers",
    description:
      "Pull tasks from Redis, process heavy workloads, and emit structured results.",
    action: "process_data task",
  },
  {
    title: "PostgreSQL Store",
    description:
      "Stores final results so they can be retrieved even if workers restart.",
    action: "Processed task table",
  },
  {
    title: "FastAPI Retrieval",
    description:
      "Clients poll or fetch final output and logs using the task id they received.",
    action: "GET /example/task/{task_id}",
  },
  {
    title: "Flower Dashboard",
    description:
      "Real-time observability for queues, workers, and task logs with filtering.",
    action: "http://localhost:5555",
  },
];

const Home = () => {
  const [taskId, setTaskId] = useState(null);

  const heroCards = useMemo(
    () => [
      {
        label: "Submit",
        title: "Enqueue Workloads",
        subtitle: "Create a new async job",
      },
      {
        label: "Track",
        title: "Monitor Task Lifecycle",
        subtitle: "Fetch live status & result",
      },
      {
        label: "Observe",
        title: "Flower Dashboard",
        subtitle: "Monitor queues & workers",
      },
    ],
    []
  );

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Async Task Orchestrator</p>
        <h2>Launch, queue, and monitor background work with confidence.</h2>
        <p className="lede">
          This interface mirrors the production flow: FastAPI accepts requests,
          Redis queues tasks, Celery workers process them, Flower monitors the
          pipeline, and PostgreSQL stores the final result for retrieval.
        </p>

        <div className="hero-card-grid">
          {heroCards.map((card) => (
            <article key={card.title} className="hero-card">
              <span className="hero-card-label">{card.label}</span>
              {card.link ? (
                <a href={card.link} target="_blank" rel="noreferrer">
                  {card.title}
                </a>
              ) : (
                <p className="hero-card-title">{card.title}</p>
              )}
              <p className="hero-card-subtitle">{card.subtitle}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="workspace">
        <div className="panel form-panel">
          <TaskForm onTaskCreated={setTaskId} />
        </div>
        <div className="panel status-panel">
          <TaskStatus taskId={taskId} />
        </div>
      </section>

      <section className="monitoring-section">
        <div>
          <h2>Operational Visibility</h2>
          <p>
            Flower reads from the Redis broker to expose task states, worker
            uptime, and failure traces. Keep it open in production to instantly
            spot bottlenecks or stuck jobs.
          </p>
        </div>
        <a
          href="http://localhost:5555"
          target="_blank"
          rel="noreferrer"
          className="cta"
        >
          Open Flower Dashboard
        </a>
      </section>
    </>
  );
};

export default Home;

