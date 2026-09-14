import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { generatePodcast } from "@/lib/podcast.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Podcast Generator" },
      { name: "description", content: "Generate custom podcasts from any topic." },
      { property: "og:title", content: "Podcast Generator" },
      { property: "og:description", content: "Generate custom podcasts from any topic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "idle" | "loading" | "success" | "error";

function Index() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setStatus("loading");
    setAudioUrl(null);

    try {
      const result = await generatePodcast({ data: { text: topic.trim() } });
      if (!result.ok) {
        setStatus("error");
        return;
      }
      setAudioUrl(result.audioFile);
      setStatus("success");
      setTopic("");
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setAudioUrl(null);
    setTopic("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Podcast Generator
          </h1>
          <p className="text-base text-muted-foreground">
            Turn any topic into a podcast episode.
          </p>
        </header>

        <div className="rounded-3xl border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8 space-y-6">
          <div className="space-y-3">
            <label htmlFor="topic" className="block text-sm font-semibold text-foreground">
              Podcast Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Type podcast topic here..."
              disabled={status === "loading"}
              className="w-full rounded-2xl border bg-background px-5 py-4 text-base text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition-all focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === "loading" || !topic.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary"
          >
            <span role="img" aria-label="speaker">
              🔊
            </span>
            Generate Podcast
          </button>

          <div className="rounded-2xl border bg-muted/40 p-6 text-center min-h-[160px] flex flex-col items-center justify-center gap-4">
            {status === "idle" && (
              <p className="text-sm text-muted-foreground">
                Podcast will appear here.
              </p>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full bg-primary animate-bounce-dot"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-primary animate-bounce-dot"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-primary animate-bounce-dot"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Creating podcast... please wait!
                </p>
              </div>
            )}

            {status === "success" && audioUrl && (
              <div className="w-full space-y-3">
                <p className="text-base font-semibold text-foreground">
                  Podcast is ready! Click play to listen
                </p>
                <audio
                  controls
                  src={audioUrl}
                  className="w-full rounded-xl"
                >
                  Your browser does not support the audio element.
                </audio>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={audioUrl}
                    download="podcast.mp3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-all hover:bg-secondary/70 active:scale-[0.98]"
                  >
                    <span role="img" aria-label="save">
                      💾
                    </span>
                    Save Podcast
                  </a>
                  <button
                    onClick={handleReset}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
                  >
                    <span role="img" aria-label="new">
                      ✨
                    </span>
                    Generate New Podcast
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-2">
                <p className="text-base font-semibold text-destructive">
                  Oops! Something went wrong. Please try again
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
