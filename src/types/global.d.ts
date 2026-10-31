import type { FirebaseUIStore } from "@firebase-oss/ui-core";
import type en from "../messages/en.json";

type Messages = typeof en;

declare global {
  var firebaseUIStore: FirebaseUIStore | undefined;
  var firebaseAuthEmulatorConnected: boolean | undefined;
  var firebaseFirestoreEmulatorConnected: boolean | undefined;
  var firebaseFunctionsEmulatorConnected: boolean | undefined;
  var firebaseStorageEmulatorConnected: boolean | undefined;

  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
