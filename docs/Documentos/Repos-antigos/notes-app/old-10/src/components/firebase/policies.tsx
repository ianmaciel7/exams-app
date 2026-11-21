import { getTranslation } from "@firebase-oss/ui-core";
import { PolicyContext, useUI } from "@firebase-oss/ui-react";
import { useContext } from "react";
import { cn } from "@/lib/utils";

export function Policies() {
  const ui = useUI();
  const policies = useContext(PolicyContext);

  if (!policies) return null;

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const parts = getTranslation(ui, "messages", "termsAndPrivacy").split(
    /(\{tos\}|\{privacy\})/,
  );
  const className = cn("hover:underline font-semibold");

  function policyAction(url: string, label: string) {
    return onNavigate ? (
      <button
        type="button"
        className={className}
        onClick={() => onNavigate(url)}
      >
        {label}
      </button>
    ) : (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <div className="text-text-muted text-center text-xs">
      {parts.map((part: string) => {
        if (part === "{tos}") {
          return (
            <span key={part}>
              {policyAction(
                String(termsOfServiceUrl),
                getTranslation(ui, "labels", "termsOfService"),
              )}
            </span>
          );
        }

        if (part === "{privacy}") {
          return (
            <span key={part}>
              {policyAction(
                String(privacyPolicyUrl),
                getTranslation(ui, "labels", "privacyPolicy"),
              )}
            </span>
          );
        }

        return <span key={part}>{part}</span>;
      })}
    </div>
  );
}
