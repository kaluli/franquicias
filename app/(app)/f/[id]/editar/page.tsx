"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { draftFromFranchise, fetchFranchise, type Draft } from "@/lib/data";
import { FranchiseForm } from "@/components/franchise-form";
import { ErrorBox, Spinner } from "@/components/ui";

export default function EditarPage() {
  const { id } = useParams<{ id: string }>();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    fetchFranchise(id)
      .then((r) => setDraft(draftFromFranchise(r.franchise, r.answers)))
      .catch(setError);
  }, [id]);

  if (error) return <ErrorBox error={error} />;
  if (!draft) return <Spinner />;
  return <FranchiseForm initial={draft} id={id} />;
}
