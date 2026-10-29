import { knowledgePath, readKnowledgeFile } from "./knowledge-store.mjs";
import { exampleKnowledge } from "../examples/knowledge-example.mjs";

export function knowledgeApi(root = process.cwd()) {
  const storePath = knowledgePath(root);
  const middleware = async (req, res, next) => {
    if (!req.url?.startsWith("/api/knowledge")) return next();
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname !== "/api/knowledge") return next();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET");
      return res.end(JSON.stringify({ error: "网页只读，知识更新通过本机Agent协议完成。" }));
    }
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`
      || req.headers["sec-fetch-site"] === "cross-site") {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: "拒绝跨来源读取本地资料。" }));
    }
    try {
      if ([...url.searchParams.keys()].some((key) => key !== "example") || url.searchParams.has("example") && url.searchParams.get("example") !== "1") {
        throw new Error("不支持此知识库查询参数。");
      }
      const example = url.searchParams.get("example") === "1";
      const kb = example ? exampleKnowledge() : await readKnowledgeFile(storePath, true);
      res.end(JSON.stringify({ dataset: example ? "example" : "private", knowledge: kb }));
    } catch (error) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: `知识库不可用，未以空画像替代。${error.message}` }));
    }
  };
  return {
    name: "private-growth-knowledge",
    configureServer(server) {
      server.middlewares.use(middleware);
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent(new URL(req.url || "/", "http://127.0.0.1").pathname).replaceAll("\\", "/");
        if (/\.(?:json|tmp|lock)$/i.test(pathname) && /(?:knowledge|private|batch)/i.test(pathname) || /(?:^|\/)(?:knowledge\/private)(?:\/|$)/i.test(pathname)) {
          res.statusCode = 403; res.end("Use the read-only knowledge API."); return;
        }
        next();
      });
    },
    configurePreviewServer(server) { server.middlewares.use(middleware); }
  };
}
