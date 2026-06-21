import { useEffect, useState } from "react";

import { GalleryPage } from "./pages/GalleryPage";
import { NotebookPage } from "./pages/NotebookPage";
import { parseRoute, type Route } from "./route";

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
