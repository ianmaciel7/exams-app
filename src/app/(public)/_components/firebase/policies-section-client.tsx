"use client";
import type { ComponentProps } from "react";
import { usePoliciesSectionClient } from "../../_hooks/use-policies-section-client";
import { PoliciesSection } from "./policies-section";

type PoliciesSectionClientProps = Omit<
  ComponentProps<typeof PoliciesSection>,
  "policies"
>;
function PoliciesSectionClient(props: PoliciesSectionClientProps) {
  const policies = usePoliciesSectionClient();
  return <PoliciesSection {...props} policies={policies} />;
}

export { PoliciesSectionClient };
