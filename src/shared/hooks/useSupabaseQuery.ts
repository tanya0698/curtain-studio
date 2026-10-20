import { useCallback, useEffect, useState } from 'react';

type QueryResult<T> = { data: T | null; error: unknown };

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
  /** Last successful data, kept while a refetch is in flight. */
  lastGood: T | null;
}

const messageOf = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return String(error);
};

/**
 * Runs a Supabase query and tracks loading / error / retry.
 *
 * supabase-js resolves failures (including network errors and outages) as
 * `{ error }` rather than throwing, so pages that only read `data ?? []`
 * silently render "nothing found". This surfaces the error instead.
 *
 * `deps` must be serialisable (ids, slugs) — they key the request, so a stale
 * response from a previous filter can never overwrite the current one.
 */
export function useSupabaseQuery<T>(
  run: () => PromiseLike<QueryResult<T>>,
  deps: ReadonlyArray<string | number | boolean | null | undefined>,
) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const key = JSON.stringify([...deps, attempt]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(run()).then(
      ({ data, error }) => {
        if (cancelled) return;
        setSettled(prev => error
          ? { key, data: null, error: messageOf(error), lastGood: prev?.lastGood ?? null }
          : { key, data, error: null, lastGood: data });
      },
      (thrown: unknown) => {
        if (!cancelled) setSettled(prev => ({ key, data: null, error: messageOf(thrown), lastGood: prev?.lastGood ?? null }));
      },
    );
    return () => { cancelled = true; };
    // `run` is a fresh closure each render; the request is keyed by `deps` instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = settled?.key === key ? settled : null;
  const retry = useCallback(() => setAttempt(a => a + 1), []);

  return {
    // While (re)loading, keep showing the previous result rather than blanking
    data: current ? current.data : settled?.lastGood ?? null,
    error: current?.error ?? null,
    loading: current === null,
    retry,
  };
}
