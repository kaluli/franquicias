"use client";

import { useEffect, useState } from "react";
import { fetchFranchises } from "./data";
import type { Franchise } from "./types";

export function useFranchises() {
  const [data, setData] = useState<Franchise[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFranchises()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}

export function byScore(a: Franchise, b: Franchise) {
  return (b.score ?? -1) - (a.score ?? -1);
}
