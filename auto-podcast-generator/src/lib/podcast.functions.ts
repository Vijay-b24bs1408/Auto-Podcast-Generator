import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type PodcastResult =
  | { ok: true; audioFile: string }
  | { ok: false; error: string };

function extractAudioFile(raw: unknown): string | null {
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (item && typeof item === "object") {
    const value = (item as Record<string, unknown>)["audioFile"];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}


export const generatePodcast = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ text: z.string().min(1).max(500) }).parse(data)
  )
  .handler(async ({ data }): Promise<PodcastResult> => {
    const webhookUrl = "https://workflow.ccbp.in/webhook/2469c575-f02e-44fe-b27f-dfcffdebe954";

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text }),
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("Webhook error", response.status, text.slice(0, 500));
        return { ok: false, error: `Webhook returned ${response.status}` };
      }

      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        console.error("Webhook returned non-JSON:", text.slice(0, 500));
        return { ok: false, error: "Invalid response from webhook" };
      }

      const audioFile = extractAudioFile(raw);
      if (!audioFile) {
        console.error("No audioFile in webhook response:", text.slice(0, 500));
        return { ok: false, error: "No audio returned" };
      }

      return { ok: true, audioFile };
    } catch (error) {
      console.error("Podcast generation failed:", error);
      return { ok: false, error: "Request failed" };
    }
  });
