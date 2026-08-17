export type AppRoute =
  | { name: "home"; params: URLSearchParams }
  | { name: "seeds"; params: URLSearchParams }
  | { name: "seedDetail"; seedId: string; params: URLSearchParams }
  | { name: "consult"; params: URLSearchParams }
  | { name: "about"; params: URLSearchParams }
  | { name: "contact"; params: URLSearchParams }
  | { name: "dataEditor"; params: URLSearchParams }
  | { name: "notFound"; params: URLSearchParams };

export const routeHref = (path: string): string => `#${path}`;

export const parseHashRoute = (hash: string): AppRoute => {
  const raw = hash.replace(/^#/, "") || "/";
  const [pathname, search = ""] = raw.split("?");
  const params = new URLSearchParams(search);
  const path = pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  if (path === "/") {
    return { name: "home", params };
  }

  if (path === "/seeds") {
    return { name: "seeds", params };
  }

  if (segments[0] === "seeds" && segments[1]) {
    return { name: "seedDetail", seedId: segments[1], params };
  }

  if (path === "/consult") {
    return { name: "consult", params };
  }

  if (path === "/about") {
    return { name: "about", params };
  }

  if (path === "/contact") {
    return { name: "contact", params };
  }

  if (path === "/data-editor") {
    return { name: "dataEditor", params };
  }

  return { name: "notFound", params };
};

export const canonicalForHash = (baseUrl: string, hashPath: string): string => {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${hashPath.startsWith("#") ? hashPath : `#${hashPath}`}`;
};
