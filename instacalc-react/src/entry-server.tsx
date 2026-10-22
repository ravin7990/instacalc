import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { createElement } from "react";
import App from "@/app/App";
import { __setServerLookup } from "@/data/seo";
import { getSeo as serverGetSeo } from "@/data/seo-server";
import { __setContentLookup } from "@/data/content";
import { getContent as serverGetContent } from "@/data/content-server";

// The renderer runs in Node, so it resolves SEO and prose content from the full
// datasets rather than the inline payloads the browser will use.
__setServerLookup(serverGetSeo);
__setContentLookup(serverGetContent);

/**
 * Server entry used by the prerenderer.
 *
 * Every route is rendered to real HTML at build time, so crawlers and the first
 * paint both see content without executing JavaScript. This is what preserves
 * the existing rankings — a client-only SPA would not.
 *
 * Uses renderToPipeableStream rather than renderToString because the app has
 * Suspense boundaries around lazy() routes; only the streaming renderer waits
 * for them to resolve instead of emitting a fallback.
 */
export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Fail loudly instead of hanging if a page throws during prerender.
    const timer = setTimeout(() => {
      abortHandle?.abort();
      reject(new Error(`prerender timed out for ${path}`));
    }, 15_000);
    timer.unref?.();

    let abortHandle: { abort: () => void } | undefined;

    const { pipe, abort } = renderToPipeableStream(createElement(App, { path }), {
      onAllReady() {
        const chunks: Buffer[] = [];
        const sink = new PassThrough();
        sink.on("data", (c: Buffer) => chunks.push(c));
        sink.on("end", () => {
          clearTimeout(timer);
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
        sink.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
        pipe(sink);
      },
      onError(err) {
        clearTimeout(timer);
        reject(err);
      },
    });

    abortHandle = { abort };
  });
}

export default render;
