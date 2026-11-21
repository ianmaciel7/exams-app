# Entity-relationship diagram

## Status: pending product persistence model

The product domain and its entity-relationship diagram (ERD) remain pending.
The template already stores technical user preferences in Firestore and avatar
objects in Storage; this is not a defined business entity model. When a product
model is adopted, document entities, relevant attributes, relationships,
cardinalities, and integrity constraints here.

The UI and AI Elements libraries do not establish a product persistence model.
When that model is adopted, record its decision in `docs/adr/` and update
[ARCHITECTURE.md](ARCHITECTURE.md) together with this diagram.

Do not add speculative entities or relationships to this document: they must
reflect the adopted domain and persistence implementation.

## Existing technical persistence

`src/app/(protected)/profile/_lib/data.ts` reads and merges `locale` and
`theme` at `users/{uid}`. `firestore.rules` permits access only to the matching
authenticated UID and validates allowed fields and values. Avatar objects live
at `users/{uid}/avatar`, governed by `storage.rules`; Auth profile attributes
remain in Firebase Authentication. These stores do not establish a cross-service
transaction or a relational foreign key.

```mermaid
erDiagram
    FIREBASE_AUTH_USER ||--o| FIRESTORE_USER_PREFERENCES : "identifies (1:1)"
    FIREBASE_AUTH_USER ||--o| STORAGE_AVATAR : "owns (1:0..1)"
    FIREBASE_AUTH_USER ||--o{ LOGGING_USAGE_EVENT : "triggers (1:N)"
    FIREBASE_AUTH_USER ||--o{ FIRESTORE_LEGACY_USAGE_LOG : "referenced_in (1:N historic)"

    FIREBASE_AUTH_USER {
        string uid PK "Unique User Identifier"
        string email "User email address"
        string displayName "Profile display name"
        string photoURL "Profile avatar download URL"
        boolean emailVerified "Email verification flag"
        string role "Custom Claim: user | admin"
    }

    FIRESTORE_USER_PREFERENCES {
        string uid PK, FK "Doc ID: users/{uid}"
        string locale "en | pt-BR | es"
        string theme "light | dark | system"
    }

    STORAGE_AVATAR {
        string uid PK, FK "Object: users/{uid}/avatar"
        string contentType "image/jpeg | image/png | image/webp"
        int maxSize "Max size: 2MB (2097152 bytes)"
    }

    LOGGING_USAGE_EVENT {
        uuid eventId PK "Generated event UUID"
        string uid FK "Caller user UID from request.auth.uid"
        string type "screen_view | function_use"
        string name "/profile | profile.update"
        int schemaVersion "Always 1"
    }

    FIRESTORE_LEGACY_USAGE_LOG {
        string logId PK "Doc ID: usageLogs/{logId}"
        string access "Inaccessible to browser clients (allow read, write: false)"
    }
```

See [Architecture](ARCHITECTURE.md#runtime-and-component-boundaries) and
[Security](SECURITY.md). A shadcn/ui component, form schema, registry manifest,
or upstream documentation refresh does not adopt a product persistence model.
