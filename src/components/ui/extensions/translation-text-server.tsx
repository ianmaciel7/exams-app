import "server-only";

import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";
import { getTranslations } from "next-intl/server";

type TranslationKey = MessageKeys<Messages, NestedKeyOf<Messages>>;

type TranslationTextServerProps = {
  message: TranslationKey;
};

/**
 * Resolves one simple message on the server, so a Server Component page can
 * declare its texts in JSX. Messages with arguments or rich text use
 * `getTranslations` directly.
 */
async function TranslationTextServer({ message }: TranslationTextServerProps) {
  const t = await getTranslations();

  return t(message);
}

export { TranslationTextServer };
