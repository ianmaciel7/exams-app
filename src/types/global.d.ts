import type { FirebaseUIStore } from "@firebase-oss/ui-core";
import type { routing } from "@/i18n/routing";
import type messages from "../messages/en.json";

declare global {
  var firebaseUIStore: FirebaseUIStore | undefined;
  var firebaseAuthEmulatorConnected: boolean | undefined;
  var firebaseDatabaseEmulatorConnected: boolean | undefined;
  var firebaseFirestoreEmulatorConnected: boolean | undefined;
  var firebaseFunctionsEmulatorConnected: boolean | undefined;
  var firebaseStorageEmulatorConnected: boolean | undefined;
}

// next-intl 4 reads message and locale types from `AppConfig`; the global
// `IntlMessages` interface from next-intl 3 is ignored.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
