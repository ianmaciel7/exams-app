import "server-only";

import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";
import { getTranslations } from "next-intl/server";

type TranslationKey = MessageKeys<Messages, NestedKeyOf<Messages>>;

type TranslationParamValue =
  | string
  | number
  | boolean
  | TranslationKey
  | null
  | undefined;

type TranslationTextServerProps = {
  /** Typed catalog key, such as `Home.title`. */
  message: TranslationKey;
  /**
   * ICU argument values. A string that is a catalog key (such as
   * `Home.friend`) is translated first, so a fallback can be written as
   * `name || "Home.friend"`.
   */
  values?: Record<string, TranslationParamValue>;
};

type Translator = {
  (key: string, values?: Record<string, string>): string;
  has(key: string): boolean;
};

function resolveValue(t: Translator, value: TranslationParamValue): string {
  if (value == null) return "";
  if (typeof value !== "string") return String(value);
  // `has` keeps free text, such as a user name containing a dot, untouched.
  return t.has(value) ? t(value) : value;
}

/**
 * Resolves one message on the server, so a Server Component can declare its
 * texts in JSX, including messages with ICU arguments. Rich text uses
 * `getTranslations` directly.
 */
async function TranslationTextServer({
  message,
  values,
}: TranslationTextServerProps) {
  const translate = await getTranslations();
  if (!values) return translate(message);

  const t = translate as unknown as Translator;
  const resolved = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, resolveValue(t, value)]),
  );
  return t(message, resolved);
}

export { TranslationTextServer };
