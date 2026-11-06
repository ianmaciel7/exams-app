import { getTranslation } from "@firebase-oss/ui-core";
import { PolicyContext, useUI } from "@firebase-oss/ui-react";
import { useContext } from "react";

function Policies() {
  const ui = useUI();
  const policies = useContext(PolicyContext);

  if (!policies) {
    return null;
  }

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const termsAndPrivacyText = getTranslation(ui, "messages", "termsAndPrivacy");
  const parts = termsAndPrivacyText.split(/(\{tos\}|\{privacy\})/);

  const className =
    "font-medium text-foreground underline underline-offset-4 hover:text-primary";
  const policyLinks = new Map([
    [
      "{tos}",
      {
        url: termsOfServiceUrl,
        label: getTranslation(ui, "labels", "termsOfService"),
      },
    ],
    [
      "{privacy}",
      {
        url: privacyPolicyUrl,
        label: getTranslation(ui, "labels", "privacyPolicy"),
      },
    ],
  ]);

  return (
    <div className="text-center text-xs text-muted-foreground">
      {parts.map((part: string, index: number) => {
        const link = policyLinks.get(part);
        if (!link) {
          return <span key={index}>{part}</span>;
        }

        return onNavigate ? (
          <button
            key={index}
            type="button"
            className={className}
            onClick={() => onNavigate(link.url)}
          >
            {link.label}
          </button>
        ) : (
          <a
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            href={link.url.toString()}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

export { Policies };
