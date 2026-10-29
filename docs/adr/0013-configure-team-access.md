# ADR 0013: Configure team access

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

The production project had human access granted ad hoc in the console. One user
held Owner plus several administrative roles (IAM, service accounts, Workload
Identity, billing), which is more than day-to-day Firebase work needs and means
the same identity can change the project's security boundary. The release identity
and its permissions are already defined in Terraform
([ADR 0012](0012-configure-terraform-infrastructure.md)), but human access was not.

## Decision

Describe human access to the production project in Terraform, in two tiers:

- **Owners** hold `roles/owner`. They are the only people who change IAM, billing,
  and the project itself.
- **Firebase developers** hold a fixed set of roles for managing Firebase without
  Owner: `roles/firebase.admin`, `roles/firebaseapphosting.admin`,
  `roles/cloudfunctions.developer`, and `roles/serviceusage.serviceUsageConsumer`.
  Project-wide `roles/iam.serviceAccountUser` is not part of the set, because it
  allows acting as any service account.

Take the members from the local variables `owner_members` and
`firebase_developer_members` in an untracked `terraform.tfvars`. Account
identifiers stay out of the repository. The bindings are additive, so applying
them never removes a role granted elsewhere; narrowing an existing user is a
separate, deliberate step.

## Considered options

- **Console grants**: rejected because they are not reviewed or reproducible.
- **Authoritative bindings** (`google_project_iam_binding`): rejected for now. They
  would remove Owner from the user who runs `terraform apply` and lock out the
  only person able to apply until an Owner takes over.
- **Groups instead of individual users**: deferred until the team has more than a
  few people.

## Consequences

- Access changes are reviewed in pull requests, and the role set is explicit.
- Removing the extra roles from an existing user is manual, and applying Terraform
  afterwards needs an Owner.
- Whoever runs `terraform apply` needs permission to change IAM, so that person
  stays an Owner or applies through an Owner-controlled identity.
