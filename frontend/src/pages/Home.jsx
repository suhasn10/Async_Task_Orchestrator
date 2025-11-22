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
        link: "http://localhost:5555",
      },
    ],
    []
  );

  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-900/5 sm:px-16 lg:py-20">
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Async Task Orchestrator
          </p>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Launch, queue, and monitor background work with confidence.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600">
            This interface mirrors the production flow: FastAPI accepts requests,
            Redis queues tasks, Celery workers process them, Flower monitors the
            pipeline, and PostgreSQL stores the final result for retrieval.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {heroCards.map((card) => (
              <article
                key={card.title}
                className="group relative flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition-all hover:border-primary-200 hover:bg-white hover:shadow-lg hover:shadow-primary-900/5"
              >
                <span className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 group-hover:bg-primary-600 group-hover:text-white">
                  {card.label}
                </span>
                {card.link ? (
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-2 text-lg font-semibold text-slate-900 before:absolute before:inset-0"
                  >
                    {card.title}
                  </a>
                ) : (
                  <p className="mb-2 text-lg font-semibold text-slate-900">
                    {card.title}
                  </p>
                )}
                <p className="text-sm text-slate-500">{card.subtitle}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#f0f9ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <TaskForm onTaskCreated={setTaskId} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <TaskStatus taskId={taskId} />
        </div>
      </section>

      <section className="rounded-2xl bg-slate-900 px-6 py-12 text-center text-white shadow-xl sm:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold">Operational Visibility</h2>
          <p className="mb-8 text-slate-300">
            Flower reads from the Redis broker to expose task states, worker
            uptime, and failure traces. Keep it open in production to instantly
            spot bottlenecks or stuck jobs.
          </p>
          <a
            href="http://localhost:5555"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Open Flower Dashboard
            <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;

