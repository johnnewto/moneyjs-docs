import { useEffect, useState } from "react";

import { GalleryPage } from "./pages/GalleryPage";
import { NotebookPage } from "./pages/NotebookPage";

type Route = { name: "gallery" } | { name: "notebook"; id: string };

function parseRoute(hash: string): Route {
  const match = /^#\/n\/([\w-]+)$/.exec(hash);
  if (match) {
    return { name: "notebook", id: match[1] };
  }
  return { name: "gallery" };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setRoute(parseRoute(window.location.hash));
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route.name === "notebook") {
    return <NotebookPage id={route.id} />;
  }

  return <GalleryPage />;
}
