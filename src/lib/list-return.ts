export function listDetailHref(path: string, returnQuery: string): string {
  return `${path}?back=${encodeURIComponent(returnQuery || "home")}`;
}

export function sanitizeListReturnHref(basePath: string, back: string | undefined, allowedKeys: readonly string[]): string {
  if (!back || back === "home") return basePath;

  const source = new URLSearchParams(back.replace(/^\?/, ""));
  const safe = new URLSearchParams();

  allowedKeys.forEach((key) => {
    const value = source.get(key);
    if (value) safe.set(key, value);
  });

  const query = safe.toString();
  return query ? `${basePath}?${query}` : basePath;
}
