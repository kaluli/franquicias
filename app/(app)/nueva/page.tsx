"use client";

import { useState } from "react";
import { emptyDraft } from "@/lib/data";
import { FranchiseForm } from "@/components/franchise-form";

export default function NuevaPage() {
  const [initial] = useState(emptyDraft);
  return <FranchiseForm initial={initial} />;
}
