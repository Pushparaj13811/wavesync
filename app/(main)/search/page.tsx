"use client";

import { useState, useDeferredValue } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useTracks } from "@/lib/api/tracks";
import { TrackList } from "@/components/playlist/TrackList";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import type { Genre } from "@/types";

const genres: { value: Genre; label: string; color: string }[] = [
  { value: "electronic", label: "Electronic", color: "from-indigo-600 to-violet-700" },
  { value: "jazz", label: "Jazz", color: "from-emerald-600 to-green-700" },
  { value: "world", label: "World", color: "from-amber-600 to-orange-700" },
  { value: "latin", label: "Latin", color: "from-pink-600 to-rose-700" },
  { value: "blues", label: "Blues", color: "from-blue-600 to-indigo-700" },
  { value: "funk", label: "Funk", color: "from-yellow-600 to-amber-700" },
  { value: "classical", label: "Classical", color: "from-purple-600 to-violet-700" },
  { value: "hip-hop", label: "Hip-Hop", color: "from-red-600 to-orange-700" },
  { value: "rock", label: "Rock", color: "from-slate-600 to-zinc-700" },
  { value: "pop", label: "Pop", color: "from-cyan-600 to-teal-700" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const deferredQuery = useDeferredValue(query);

  const filters: Record<string, string> = {};
  if (deferredQuery) filters.search = deferredQuery;
  if (selectedGenre) filters.genre = selectedGenre;

  const hasFilters = !!deferredQuery || !!selectedGenre;
  const { data, isLoading } = useTracks(hasFilters ? filters : undefined);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search Input */}
      <div className="relative max-w-xl">
        <SearchIcon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-tertiary"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, artists..."
          className={cn(
            "w-full h-11 pl-10 pr-10 rounded-xl",
            "bg-surface-tertiary text-content-primary text-sm",
            "placeholder:text-content-tertiary",
            "border border-border-default focus:border-accent",
            "outline-none transition-colors",
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Genre Chips */}
      <section>
        <h2 className="text-sm font-semibold text-content-primary mb-3">
          Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.value}
              onClick={() =>
                setSelectedGenre(
                  selectedGenre === genre.value ? undefined : genre.value,
                )
              }
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
                selectedGenre === genre.value
                  ? "bg-accent text-white"
                  : "bg-surface-tertiary text-content-secondary hover:bg-surface-elevated hover:text-content-primary",
              )}
            >
              {genre.label}
            </button>
          ))}
          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre(undefined)}
              className="px-4 py-2 rounded-full text-sm font-medium text-content-tertiary hover:text-content-secondary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section>
        {hasFilters && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-content-primary">
              {deferredQuery
                ? `Results for "${deferredQuery}"`
                : `${genres.find((g) => g.value === selectedGenre)?.label} Tracks`}
            </h2>
            {data && (
              <span className="text-xs text-content-tertiary">
                {data.total} {data.total === 1 ? "track" : "tracks"}
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        ) : hasFilters && data ? (
          data.tracks.length > 0 ? (
            <TrackList tracks={data.tracks} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-content-tertiary">
              <SearchIcon size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No tracks found</p>
              <p className="text-xs mt-1">Try a different search or genre</p>
            </div>
          )
        ) : !hasFilters ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            {genres.map((genre) => (
              <button
                key={genre.value}
                onClick={() => setSelectedGenre(genre.value)}
                className={cn(
                  "relative h-24 rounded-xl overflow-hidden bg-gradient-to-br",
                  genre.color,
                  "flex items-end p-3 transition-transform hover:scale-[1.02] active:scale-[0.98]",
                )}
              >
                <span className="text-sm font-bold text-white">{genre.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
