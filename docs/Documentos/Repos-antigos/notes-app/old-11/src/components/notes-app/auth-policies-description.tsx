import { getTranslation } from "@firebase-oss/ui-core";
import { PolicyContext, useUI } from "@firebase-oss/ui-react";
import { type ComponentProps, Fragment, use } from "react";
import { PolicyLinkButton } from "@/components/notes-app/policy-link-button";
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type AuthPoliciesDescriptionProps = ComponentProps<"div">;

const PLACEHOLDER_TYPES = new Map([
  ["{tos}", "tos"],
  ["{privacy}", "privacy"],
]);

function AuthPoliciesDescription({
  className,
  ...props
}: AuthPoliciesDescriptionProps) {
  const ui = useUI();
  const policies = use(PolicyContext);

  if (!policies) {
    return null;
  }

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const termsAndPrivacyText = getTranslation(ui, "messages", "termsAndPrivacy");
  const parts = termsAndPrivacyText.split(/(\{tos\}|\{privacy\})/);

  const partCounts = new Map<string, number>();
  const keyedParts = parts.map((part) => {
    const type = PLACEHOLDER_TYPES.get(part) ?? "text";
    const occurrence = (partCounts.get(type) ?? 0) + 1;
    partCounts.set(type, occurrence);
    return { key: `${type}-${occurrence}`, part };
  });

  return (
    <FieldDescription
      data-slot="auth-policies-description"
      {...props}
      className={cn("text-muted-foreground text-center text-xs", className)}
    >
      {keyedParts.map(({ key, part }) => {
        if (part === "{tos}") {
          return (
            <PolicyLinkButton
              key={key}
              onNavigate={onNavigate}
              url={termsOfServiceUrl}
            >
              {getTranslation(ui, "labels", "termsOfService")}
            </PolicyLinkButton>
          );
        }

        if (part === "{privacy}") {
          return (
            <PolicyLinkButton
              key={key}
              onNavigate={onNavigate}
              url={privacyPolicyUrl}
            >
              {getTranslation(ui, "labels", "privacyPolicy")}
            </PolicyLinkButton>
          );
        }

        return <Fragment key={key}>{part}</Fragment>;
      })}
    </FieldDescription>
  );
}

export { AuthPoliciesDescription, type AuthPoliciesDescriptionProps };
