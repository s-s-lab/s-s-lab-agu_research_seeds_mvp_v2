const isExternalUrl = (path: string) => /^https?:\/\//i.test(path);

export const assetPath = (path: string): string => {
  if (!path) {
    return "";
  }

  if (isExternalUrl(path) || path.startsWith("data:")) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
