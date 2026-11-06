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

  let offset = 0;
  const parts = getTranslation(ui, "messages", "termsAndPrivacy")
    .split(/(\{tos\}|\{privacy\})/)
    .map((text) => {
      const part = { key: offset, text, link: links.get(text) };
      offset += text.length;
      return part;
    });

  return { onNavigate, parts };
}
