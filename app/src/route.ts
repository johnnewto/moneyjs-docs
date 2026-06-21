export type Route = { name: "gallery" } | { name: "notebook"; id: string };

export function parseRoute(hash: string): Route {
  const match = /^#\/n\/([\w-]+)$/.exec(hash);
  if (match) {
    return { name: "notebook", id: match[1] };
  }
  return { name: "gallery" };
}
