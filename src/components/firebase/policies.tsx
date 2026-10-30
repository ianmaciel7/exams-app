import { cn } from "@/lib/utils";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, PolicyContext, type PolicyURL } from "@firebase-oss/ui-react";
import { useContext } from "react";

export function Policies() {
  const ui = useUI();
  const policies = useContext(PolicyContext);

  if (!policies) {
    return null;
  }

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const termsAndPrivacyText = getTranslation(ui, "messages", "termsAndPrivacy");
  const parts = termsAndPrivacyText.split(/(\{tos\}|\{privacy\})/);

  const className = cn("hover:underline font-semibold");
  const renderLink = (key: number, url: PolicyURL, label: string) =>
    onNavigate ? (
      <button key={key} type="button" className={className} onClick={() => onNavigate(url)}>
        {label}
      </button>
    ) : (
      <a key={key} target="_blank" rel="noopener noreferrer" className={className} href={url.toString()}>
        {label}
      </a>
    );

  return (
    <div className="text-text-muted text-center text-xs">
      {parts.map((part: string, index: number) => {
        if (part === "{tos}") {
          return renderLink(index, termsOfServiceUrl, getTranslation(ui, "labels", "termsOfService"));
        }

        if (part === "{privacy}") {
          return renderLink(index, privacyPolicyUrl, getTranslation(ui, "labels", "privacyPolicy"));
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
