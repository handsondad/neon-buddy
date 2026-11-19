import { useEffect, useState } from "react";
import { QaPage } from "./pages/QaPage.tsx";
import { WallPage } from "./pages/WallPage.tsx";
import { recordById } from "./records/index.ts";

type Route = { page: "wall" } | { page: "q"; id: string };

function parseRoute(hash: string): Route {
  const [, page, param] = hash.replace(/^#/, "").split("/");
  if (page === "q" && param && recordById(param)) return { page: "q", id: param };
  return { page: "wall" };
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  if (route.page === "q") {
    const record = recordById(route.id);
    if (record) return <QaPage record={record} />;
  }
  return <WallPage />;
}
