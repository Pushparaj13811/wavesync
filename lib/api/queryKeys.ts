export const trackKeys = {
  all: ["tracks"] as const,
  lists: () => [...trackKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...trackKeys.lists(), filters] as const,
  details: () => [...trackKeys.all, "detail"] as const,
  detail: (id: string) => [...trackKeys.details(), id] as const,
};

export const playlistKeys = {
  all: ["playlists"] as const,
  lists: () => [...playlistKeys.all, "list"] as const,
  details: () => [...playlistKeys.all, "detail"] as const,
  detail: (id: string) => [...playlistKeys.details(), id] as const,
};
