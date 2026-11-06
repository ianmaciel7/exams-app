import { getTranslation } from "@firebase-oss/ui-core";
import { PolicyContext, useUI } from "@firebase-oss/ui-react";
import { useContext } from "react";

export function usePoliciesSectionClient() {
  const ui = useUI();
  const policies = useContext(PolicyContext);
  if (!policies) return null;

  const { termsOfServiceUrl, privacyPolicyUrl, onNavigate } = policies;
  const links = new Map([
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

  const texts = getTranslation(ui, "messages", "termsAndPrivacy").split(
    /(\{tos\}|\{privacy\})/,
  );
  // The offset of a part in the sentence is a stable, unique key.
  const parts = texts.map((text, position) => ({
    key: texts.slice(0, position).join("").length,
    text,
    link: links.get(text),
  }));

  return { onNavigate, parts };
}
