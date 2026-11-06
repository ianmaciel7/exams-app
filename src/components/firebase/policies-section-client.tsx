"use client";
import type { ComponentProps } from "react";
import { PoliciesSection } from "@/components/firebase/policies-section";
import { usePoliciesSectionClient } from "@/hooks/use-policies-section-client";

type PoliciesSectionClientProps = Omit<
  ComponentProps<typeof PoliciesSection>,
  "policies"
>;
function PoliciesSectionClient(props: PoliciesSectionClientProps) {
  const policies = usePoliciesSectionClient();
  return <PoliciesSection {...props} policies={policies} />;
}

export { PoliciesSectionClient };
