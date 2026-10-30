# Graph Report - exams-app  (2026-10-30)

## Corpus Check
- 675 files · ~417,286 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: (none) 9, .toml 4, .css 4)

## Summary
- 3701 nodes · 6151 edges · 348 communities (178 shown, 170 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 485 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `170c2659`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- prompt-input.tsx
- CODING_STANDARDS.md
- home-hero.tsx
- DESIGN.md Design system
- Button
- Items always inside their Group component
- 0002-configure-shadcn-ui.md
- node.tsx
- 0001-configure-nextjs.md
- scripts
- lib/navigation.ts
- profile-section-client.tsx
- check-component-conventions.test.mjs
- lucide-react
- react
- plan.tsx
- commit.tsx
- test-results.tsx
- TOOLING.md
- button.tsx
- compilerOptions
- package.json
- dependencies
- sidebar.tsx
- ARCHITECTURE.md
- voice-selector.tsx
- biome.json
- devDependencies
- use-profile-session.ts
- vitest
- Continuous integration
- client.ts
- Authentication
- CI workflow
- menubar.tsx
- Design Systems from DESIGN.md
- cn
- ai-elements/code-block.tsx
- Coding Standards
- @firebase-oss/ui-react
- queue.tsx
- DESIGN.md
- schema-display.tsx
- server.ts
- stack-trace.tsx
- toast.tsx
- pnpm-workspace.yaml (overrides, allowBuilds, audit config)
- inline-citation.tsx
- audio-player.tsx
- attachments.tsx
- Styling & Customization
- 0009-integrate-firebase-authentication.md
- speech-input.tsx
- ai-elements/message.tsx
- 0007-configure-ci.md
- environment-variables.tsx
- mic-selector.tsx
- open-in-chat.tsx
- The Design System Page
- agent.tsx
- prompt-input.test.tsx
- attachment.tsx
- adr/README.md
- sandbox.tsx
- color-pair.tsx
- reasoning.tsx
- question.tsx
- firebase-auth-basics skill
- useIsMobile
- context.tsx
- package-info.tsx
- Component Composition
- _lib/definitions.ts
- components.json
- collapsible.tsx
- context.test.tsx
- shadcn/ui
- empty.tsx
- user-roles.test.cjs
- file-tree.tsx
- Assistant activity uses Trace
- pagination.tsx
- add command
- functions/package.json
- terminal.tsx
- index.js
- README.md
- complexity/native-rules.test.ts
- progress.tsx
- persona.tsx
- review-findings.test.tsx
- Process
- Firebase Android Setup Guide
- Tools
- Application logging
- bubble.tsx
- @playwright/test
- Flutter & Firebase Setup Guide
- Firebase Local Environment Setup
- shadcn/SKILL.md
- chain-of-thought.tsx
- button.stories.tsx
- web-preview.tsx
- Agent instructions
- Customization & Theming
- shadcn template
- review-findings.browser.test.tsx
- react/native-rules.test.ts
- Colors
- context-menu.tsx
- Firebase Authentication Web SDK
- Commands
- logging.md
- ref_node_path
- ADR 0008: Install Firebase UI registry
- Firebase Auth & Google Sign-In for Flutter
- carousel.tsx
- jsx-preview.tsx
- conversation.tsx
- scripts
- clear.mjs
- profile-avatar-field-client.tsx
- skills/README.md
- Registry Authoring and Addresses
- Next.js request data and caching
- profile-save-button.tsx
- tsconfig.build.json
- firebase-basics/references/ios_setup.md
- tool.tsx
- usage-logs.test.cjs
- checkpoint.tsx
- chart.tsx
- artifact.tsx
- stryker.config.json
- app-router-imports.test.ts
- Authentication in Security Rules
- Refresh Antigravity Local Environment
- Base vs Radix
- drawer.tsx
- Firebase Authentication - Android Setup Guide (Kotlin)
- Badge
- ui/code-block.tsx
- confirmation.tsx
- item.tsx
- Antigravity Setup
- Composition: asChild (radix) vs render (base)
- ref_node_fs
- responsive.spec.ts
- Component Selection
- Reference
- ctx7 CLI
- Issue tracker: GitHub
- biome.preview.json
- Contributing
- questionnaire.tsx
- next-intl
- utils.ts
- Ask Matt
- ⛔️ CRITICAL RULE: INITIALIZATION ORDER ⛔️
- gh CLI issue operations
- routing.ts
- table.tsx
- Firebase Web Setup Guide
- serena-stdio-guard.mjs
- navigation-menu.tsx
- Recommended: Global Setup
- ⛔️ CRITICAL RULE: NO INLINE INITIALIZATION ⛔️
- firebase-basics/SKILL.md
- openai.yaml agent interface config
- Use the glossary's vocabulary rule
- PRs as a triage surface flag
- Serena project.yml configuration
- cspell.json
- ref_node_module
- Recommended: Global Setup
- TooltipProvider
- field.tsx
- ai
- ref_node_os
- Alternative: Manual MCP Configuration (Project Scope)
- GitHub native issue dependencies (blocked_by)
- sgconfig.yml (ast-grep config)
- marker.tsx
- coverage.md
- Workflow
- edge.tsx
- needs-info
- Recommended Method: Using Plugins
- Cursor Setup
- .fallowrc.json
- google-services.json (app-level)
- Android Studio MCP skipped: SSE-only vs stdio
- resizable.tsx
- ui/message.tsx
- match-component-filename.js
- use-profile-submit.ts
- doctor.config.json
- create-next-app default starter assets
- firebase-auth-sw.js
- shadcn/ui logo (two white diagonal bars on black rounded square)
- Document/file icon (gray page outline with folded corner and text lines)
- Browser window icon (window.svg)
- post-checkout
- post-commit
- AuthService (Dart boilerplate)
- Bypass Firestore composite index with client-side sort
- google_sign_in 7.x API changes (signIn -> authenticate, token separation)
- AuthService.signInWithGoogle
- AuthService.signOut
- auth/unauthorized-domain troubleshooting (add localhost, no protocol/port)
- Flutter Web initialize() hang without clientId (DWDS)
- Web signOut crash when GoogleSignIn skipped
- addStateDidChangeListener auth state
- Email/password auth with async/await (sign up, sign in)
- No inline Auth.auth() initialization rule (lazy or after configure)
- iOS signOut
- Ownership checks (uid == userId, owner_uid field)
- request.auth variable
- App Check debug token persistence (Android, local.properties)
- google-services Gradle plugin (project and module level)
- Never hardcode or commit debug tokens
- Resolve plugin version from Google Maven (never hardcode)
- WidgetsFlutterBinding.ensureInitialized before Firebase.initializeApp
- Platform build requirements (Android minSdk, iOS pod install/SPM)
- Re-run flutterfire configure on rename or adding services
- Web CORS best practice (fixed localhost port, no disable-web-security)
- App Check debug token persistence (iOS, env var)
- AppDelegate configure pattern
- Automated iOS project/app/plist setup via CLI
- FirebaseApp.configure() before state objects (SwiftUI init order)
- Prefer Observation framework over Combine
- SwiftUI YourApp safe init pattern
- Verify Firebase authentication (login)
- Verify Node.js >= 20 (nvm recommended)
- npx skills update workflow (project vs global)
- Firebase plugin marketplace install (claude plugin install firebase@firebase)
- Gemini extension install (skills plus MCP)
- App Check debug token persistence
- Firebase web SDK initialization (initializeApp, getAuth)
- Ask developer: existing Project ID or new project
- Automated config retrieval via apps:sdkconfig
- firebase login --no-localhost
- npx -y firebase-tools@latest convention
- Firebase Usage Principles (npx, official docs, skills, MCP, config via CLI)
- allow_implicit_invocation false policy
- Shared issue/PR number space
- Sub-issues (parent/child)
- Wayfinding operations (GitHub)
- GitLab native blocking link (/blocked_by)
- glab CLI issue operations
- GitLab notes (comments)
- Wayfinding operations (GitLab)
- Blocked by: line convention
- Local .scratch/ feature directory layout
- Status: line triage state
- Wayfinding operations (local files)
- Agent skills block in CLAUDE.md/AGENTS.md
- Domain docs layout (single vs multi-context)
- Issue tracker configuration (docs/agents/issue-tracker.md)
- Triage label vocabulary (five canonical roles)
- needs-triage
- ready-for-agent
- ready-for-human
- Five canonical triage roles
- wontfix
- shadcn OpenAI agent interface config
- shadcn/ui display interface (name, description, icons)
- apply command
- build command
- components.json configuration
- diff command (deprecated)
- docs command
- Dry-run / --diff / --view mode
- info command
- init command
- search command
- view command
- Changing the theme via presets
- Checking for updates (--diff)
- Adding custom colors (Tailwind v3 and v4)
- Control heights move together
- Inputs to confirm (preset, DESIGN.md, template, base)
- Do and Don't pairs
- Page outline (13 sections)
- Pinned states via data-preview
- Picking a style (vega, nova, maia, lyra, mira, luma, rhea, sera)
- Step 5: Map component recipes to variants (cva)
- get_add_command_for_items tool
- get_audit_checklist tool
- get_item_examples_from_registries tool
- get_project_registries tool
- list_items_in_registries tool
- search_items_in_registries tool
- view_items_in_registries tool
- Build and verify commands
- Resolve ref to commit SHA flow
- asChild (radix) vs render (base)
- nativeButton={false} for non-button render
- Select multiple and object values (base)
- ToggleGroup (multiple vs type)
- Attachment component
- Bubble message surface
- CodeBlock (code and tool output)
- Marker (system notes and dividers)
- Message row component
- MessageScroller (scrollable threads)
- Scroller hooks escape hatch
- Streaming, anchoring, jump-to-latest built in
- Trace / TraceLine (assistant activity)
- TraceCollapsible pattern
- Avatar needs AvatarFallback
- Button has no isPending; compose Spinner
- Use Separator/Skeleton/Badge instead of custom markup
- Items inside Group components
- Dialog/Sheet/Drawer need a Title
- TabsTrigger inside TabsList
- Toast follows project base
- FieldSet + FieldLegend grouping
- InputGroup requires InputGroupInput/Textarea
- Buttons in inputs use InputGroupAddon
- Option sets use ToggleGroup
- data-icon attribute in Button
- Use project's configured iconLibrary
- No sizing classes on icons in components
- No space-x/space-y; use gap
- No manual z-index on overlays
- shimmer / scroll-fade utilities
- Prefer size-* and truncate
- Design systems from DESIGN.md flow
- Registry must be explicit rule
- Critical rules: chat & messaging
- Critical rules: CLI and presets
- Critical rules: component structure & composition
- Critical rules: forms & inputs
- Critical rules: icons
- Critical rules: styling & Tailwind
- Semantic colors over raw values
- Switching presets (overwrite/partial/merge/skip)
- firebase.json and .firebaserc
- showcase-coverage.mjs
- PromptInput
- InternalPromptInputControllerProps

## God Nodes (most connected - your core abstractions)
1. `react` - 144 edges
2. `Button()` - 66 edges
3. `cn` - 63 edges
4. `scripts` - 59 edges
5. `lucide-react` - 57 edges
6. `vitest` - 49 edges
7. `Component Selection` - 44 edges
8. `@base-ui/react` - 40 edges
9. `next-intl` - 32 edges
10. `@firebase-oss/ui-react` - 32 edges

## Surprising Connections (you probably didn't know these)
- `Component Selection` --references--> `ContextMenu()`  [INFERRED]
  .agents/skills/shadcn/SKILL.md → src/components/ui/context-menu.tsx
- `Items always inside their Group component` --references--> `ContextMenuGroup()`  [INFERRED]
  .agents/skills/shadcn/rules/composition.md → src/components/ui/context-menu.tsx
- `Items always inside their Group component` --references--> `ContextMenuItem()`  [INFERRED]
  .agents/skills/shadcn/rules/composition.md → src/components/ui/context-menu.tsx
- `Avatar always needs AvatarFallback` --references--> `AvatarFallback()`  [INFERRED]
  .agents/skills/shadcn/rules/composition.md → src/components/ui/avatar.tsx
- `Select — multiple selection and object values (base only)` --references--> `SelectValue()`  [INFERRED]
  .agents/skills/shadcn/rules/base-vs-radix.md → src/components/ui/select.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI pipeline aggregated by ci-result** — docs_adr_0007_configure_ci_parallel_jobs, docs_adr_0007_configure_ci_verify_scripts, docs_adr_0007_configure_ci_ci_result [EXTRACTED 0.90]
- **Testing toolchain layers** — docs_adr_0006_configure_testing_vitest_multi_project, docs_adr_0006_configure_testing_playwright_suites, docs_adr_0006_configure_testing_property_based_testing, docs_adr_0006_configure_testing_mutation_testing [EXTRACTED 0.90]
- **Chat component composition** — agents_skills_shadcn_rules_chat_messagescroller, agents_skills_shadcn_rules_chat_message, agents_skills_shadcn_rules_chat_bubble, agents_skills_shadcn_rules_chat_attachment, agents_skills_shadcn_rules_chat_marker, agents_skills_shadcn_rules_chat_trace, agents_skills_shadcn_rules_chat_codeblock [EXTRACTED 0.95]
- **App Check debug token persistence without committing secrets** — agents_skills_firebase_basics_references_android_setup_app_check_debug_token, agents_skills_firebase_basics_references_ios_setup_app_check_debug_token, agents_skills_firebase_basics_references_android_setup_never_commit_debug_tokens [EXTRACTED 1.00]
- **Agent environment refresh guides** — agents_skills_firebase_basics_references_refresh_android_studio_refresh_android_studio_local_environment, agents_skills_firebase_basics_references_refresh_antigravity_refresh_antigravity_local_environment, agents_skills_firebase_basics_references_refresh_gemini_cli_refresh_gemini_cli_local_environment [EXTRACTED 1.00]
- **Root project documentation guides** — architecture, coding_standards, tooling, testing, security, design_md, contributing [EXTRACTED 1.00]
- **CI jobs aggregated by ci-result required check** — github_workflows_ci_static, github_workflows_ci_build, github_workflows_ci_e2e, github_workflows_ci_auth_emulator, github_workflows_ci_security, github_workflows_ci_pr_title, github_workflows_ci_ci_result [EXTRACTED 1.00]
- **Playwright image pin shared by CI e2e, visual baselines and Dependabot mirror** — playwright_container_image, github_workflows_ci_e2e, github_workflows_visual_baselines_update, github_dependabot_docker_mirror_updates [EXTRACTED 1.00]
- **Base vs Radix API differences** — agents_skills_shadcn_rules_base_vs_radix_as_child_vs_render, agents_skills_shadcn_rules_base_vs_radix_select, agents_skills_shadcn_rules_base_vs_radix_toggle_group, agents_skills_shadcn_rules_base_vs_radix_slider, agents_skills_shadcn_rules_base_vs_radix_accordion [EXTRACTED 1.00]
- **DESIGN.md to design system pipeline** — agents_skills_shadcn_design_system_step_1_scaffold, agents_skills_shadcn_design_system_step_4_map_tokens_to_the_theme, agents_skills_shadcn_design_system_recipes_to_variants, agents_skills_shadcn_design_system_step_6_build_the_design_system_page, agents_skills_shadcn_design_system_step_7_verify [EXTRACTED 1.00]
- **Default public SVG starter assets** — public_globe, public_next, public_vercel [INFERRED 0.75]
- **Firebase per-agent setup guides** — agents_skills_firebase_basics_references_setup_cursor, agents_skills_firebase_basics_references_setup_github_copilot, agents_skills_firebase_basics_references_setup_other_agents, agents_skills_firebase_basics_references_setup_antigravity, agents_skills_firebase_basics_references_setup_gemini_cli, agents_skills_firebase_basics_references_setup_claude_code, agents_skills_firebase_basics_references_setup_android_studio [INFERRED 0.85]
- **Firebase persistence and rules boundary** — architecture_firestore_storage_rules, der_technical_persistence, security_firebase_rules_authority, der_user_preferences_module [INFERRED 0.85]
- **Wayfinding operations across GitHub, GitLab and local trackers** — agents_skills_setup_matt_pocock_skills_issue_tracker_github_wayfinding, agents_skills_setup_matt_pocock_skills_issue_tracker_gitlab_wayfinding, agents_skills_setup_matt_pocock_skills_issue_tracker_local_wayfinding [INFERRED 0.85]

## Communities (348 total, 170 thin omitted)

### Community 0 - "prompt-input.tsx"
Cohesion: 0.03
Nodes (44): AttachmentsContext, LocalAttachmentsContext, LocalReferencedSourcesContext, PromptInputActionAddAttachmentsProps, PromptInputActionAddScreenshotProps, PromptInputActionMenuContentProps, PromptInputActionMenuItemProps, PromptInputActionMenuProps (+36 more)

### Community 1 - "CODING_STANDARDS.md"
Cohesion: 0.06
Nodes (47): React runtime and lifecycle boundaries (Activity, Effects), Next.js onRequestError instrumentation logging, SDK and provider adapter contracts (AI SDK), Boolean UI phase flags instead of status tag, Biome complexity budget (cognitive 8, 40 lines, nesting 2), Composition guard coverage (check:components), Dependency inversion in presentation screens, State derivation and Effect elimination (+39 more)

### Community 2 - "home-hero.tsx"
Cohesion: 0.24
Nodes (10): HomeHero(), HomeHeroActions(), HomeHeroActionsProps, HomeHeroDescription(), HomeHeroDescriptionProps, HomeHeroHeader(), HomeHeroHeaderProps, HomeHeroProps (+2 more)

### Community 3 - "DESIGN.md Design system"
Cohesion: 0.18
Nodes (15): Cache Components, partial prefetching, React Compiler runtime, Compound APIs vs Server/Client runtime graphs, Cache Components APIs (use cache, cacheLife, revalidateTag, updateTag), Compound components and named exports, AI Elements upstream patterns, Light/dark color tokens in globals.css, Component composition contracts (Card parts, buttonVariants), src/app/globals.css (+7 more)

### Community 4 - "Button"
Cohesion: 0.04
Nodes (43): Step 5: Map Component Recipes to Variants, Buttons inside inputs use InputGroup + InputGroupAddon, Contents, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup, CLI (+35 more)

### Community 5 - "Items always inside their Group component"
Cohesion: 0.13
Nodes (23): Attachments use Attachment, Chat & Messaging, Contents, Escape hatch: the scroller hooks, Message rows use Message, Scrollable threads use MessageScroller, Streaming, anchoring, and jump-to-latest are built in, Items always inside their Group component (+15 more)

### Community 6 - "0002-configure-shadcn-ui.md"
Cohesion: 0.08
Nodes (28): ADR 0002: Configure shadcn/ui, AI SDK Elements registry, base-nova preset with Base UI primitives, Biome overrides for vendored components, cn class name utility (src/lib/utils.ts), Copy-paste component code ownership, Consequences, Context (+20 more)

### Community 7 - "node.tsx"
Cohesion: 0.12
Nodes (24): Component Structure → [composition.md](./rules/composition.md), Compound components and Server/Client boundaries, Component composition contracts, NodeActionProps, NodeContentProps, NodeDescriptionProps, NodeFooterProps, NodeHeaderProps (+16 more)

### Community 8 - "0001-configure-nextjs.md"
Cohesion: 0.10
Nodes (21): PageProps LayoutProps RouteContext helpers, Biome replaces ESLint and Prettier, ADR 0001: Configure Next.js, Consequences, Context, Decision, References, create-next-app bootstrap command (+13 more)

### Community 9 - "scripts"
Cohesion: 0.03
Nodes (59): scripts, analyze:bundle, analyze:fallow, analyze:health, analyze:lighthouse, analyze:lighthouse:ci, analyze:react, analyze:size (+51 more)

### Community 10 - "lib/navigation.ts"
Cohesion: 0.17
Nodes (11): ProtectedGuardClient(), ProtectedGuardClientProps, ProtectedSessionServer(), ProtectedSessionServerProps, useProtectedGuardClient(), ProtectedLayout(), src_lib_firebase_usage, src_lib_firebase_usage_recordusage (+3 more)

### Community 11 - "profile-section-client.tsx"
Cohesion: 0.18
Nodes (17): ProfileCard(), ProfileCardAction(), ProfileCardActionProps, ProfileCardContent(), ProfileCardContentProps, ProfileCardDescription(), ProfileCardDescriptionProps, ProfileCardFooter() (+9 more)

### Community 12 - "check-component-conventions.test.mjs"
Cohesion: 0.12
Nodes (15): scripts_checks_check_component_conventions, scripts_checks_check_component_conventions_inspectcomponent, scripts_checks_check_component_conventions_inspectcomponentplacement, scripts_checks_check_component_conventions_inspectcomponentruntime, scripts_checks_check_component_conventions_inspectdatamoduleconventions, scripts_checks_check_component_conventions_inspecthookfilename, scripts_checks_check_component_conventions_inspectlibplacement, scripts_checks_check_component_conventions_inspectnaming (+7 more)

### Community 13 - "lucide-react"
Cohesion: 0.06
Nodes (22): lucide-react, ModelSelectorContentProps, ModelSelectorDialogProps, ModelSelectorEmptyProps, ModelSelectorGroupProps, ModelSelectorInputProps, ModelSelectorItemProps, ModelSelectorListProps (+14 more)

### Community 14 - "react"
Cohesion: 0.25
Nodes (11): Workflow, react, ProfileLocaleFieldProps, ProfileThemeFieldProps, ProfileValues, src_components_ui_select_select, SelectContent(), SelectGroup() (+3 more)

### Community 15 - "plan.tsx"
Cohesion: 0.11
Nodes (13): PlanActionProps, PlanContentProps, PlanContext, PlanContextValue, PlanDescription(), PlanDescriptionProps, PlanFooterProps, PlanHeaderProps (+5 more)

### Community 16 - "commit.tsx"
Cohesion: 0.04
Nodes (27): CommitActionsProps, CommitAuthorAvatarProps, CommitAuthorProps, CommitContentProps, CommitCopyButtonProps, CommitFileAdditionsProps, CommitFileChangesProps, CommitFileDeletionsProps (+19 more)

### Community 17 - "test-results.tsx"
Cohesion: 0.05
Nodes (29): formatDuration(), statusIcons, statusStyles, TestContext, TestContextType, TestDurationProps, TestErrorMessageProps, TestErrorProps (+21 more)

### Community 18 - "TOOLING.md"
Cohesion: 0.11
Nodes (29): Next.js managed agent-rules block, dependency-cruiser boundary rules, Test conventions (colocated, RTL queries), Pinned runtimes (Node, Next.js 16.4.1, React 19.3.0, pnpm 12.11.2), CI security scanners (Semgrep, Gitleaks, audit, zizmor), Test layers (unit, browser, e2e, a11y, visual, emulator, mutation), Agent tooling, Application libraries (+21 more)

### Community 19 - "button.tsx"
Cohesion: 0.08
Nodes (27): HomeSignOutButtonClientProps, CountrySelector, src_components_firebase_country_selector_countryselectorref, MultiFactorAuthAssertionForm(), MultiFactorAuthAssertionFormProps, PhoneAuthForm(), PhoneNumberForm(), onSubmit() (+19 more)

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "package.json"
Cohesion: 0.04
Nodes (44): engines, node, lint-staged, *.{js,jsx,ts,tsx,json,jsonc,css}, *.{md,mdx,mjs,cjs,yml,yaml}, name, packageManager, private (+36 more)

### Community 22 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, ai, ansi-to-react, @base-ui/react, class-variance-authority, cmdk, cn, date-fns (+36 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.07
Nodes (14): Fonts, SheetContent(), SheetDescription(), SheetHeader(), SheetTitle(), Sidebar(), SidebarContext, SidebarContextProps (+6 more)

### Community 24 - "ARCHITECTURE.md"
Cohesion: 0.07
Nodes (36): Application boundaries, Architecture, Authentication navigation and ?next= return URL, Authentication navigation, Compound APIs and runtime graphs, Cookie-driven NEXT_LOCALE internationalization, Decision records, Firebase auth session bridge service worker (FirebaseServerApp) (+28 more)

### Community 25 - "voice-selector.tsx"
Cohesion: 0.05
Nodes (21): VoiceSelectorAccentProps, VoiceSelectorAgeProps, VoiceSelectorAttributesProps, VoiceSelectorBulletProps, VoiceSelectorContentProps, VoiceSelectorContext, VoiceSelectorContextValue, VoiceSelectorDescriptionProps (+13 more)

### Community 26 - "biome.json"
Cohesion: 0.05
Nodes (40): source, assist, actions, noExcessiveCognitiveComplexity, css, parser, next, react (+32 more)

### Community 28 - "devDependencies"
Cohesion: 0.05
Nodes (40): devDependencies, @ast-grep/cli, @axe-core/playwright, babel-plugin-react-compiler, @biomejs/biome, @commitlint/cli, @commitlint/config-conventional, cspell (+32 more)

### Community 29 - "use-profile-session.ts"
Cohesion: 0.18
Nodes (14): Runtime and component boundaries, Owned function complexity and hook responsibility trees, next-themes, ProfileSectionClient(), useProfileAuth(), useProfilePreferences(), useProfileSectionClient(), useProfileSession() (+6 more)

### Community 30 - "vitest"
Cohesion: 0.08
Nodes (17): root, @firebase-oss/ui-translations, ref_node_url, @tailwindcss/vite, @testing-library/react, @vitejs/plugin-react, vitest, @vitest/browser-playwright (+9 more)

### Community 31 - "Continuous integration"
Cohesion: 0.18
Nodes (12): Commit hook environment failure disclosure, After creating a repository from template checklist, braces GHSA-vfj7-8cjw-p6xm accepted risk, Adapting the tests in a generated project, Automated accessibility limits, Continuous integration, Firebase emulator regression coverage, Known limitations (+4 more)

### Community 32 - "client.ts"
Cohesion: 0.06
Nodes (51): HomeSession, useHomeSession(), useHomeSignOutButtonClient(), handleSignOut(), AccessSubscriptionOptions, notifySessionTransition(), SessionHandlerState, subscribeToProtectedSession() (+43 more)

### Community 33 - "Authentication"
Cohesion: 0.33
Nodes (5): Authentication, Local development and verification, Related references, Roles and allowlist, Token failures and sign-out

### Community 34 - "CI workflow"
Cohesion: 0.11
Nodes (25): Dependabot configuration, Dependabot docker updates via playwright mirror Dockerfile, Dependabot github-actions updates (SHA-pinned), CI Python tool pins (requirements.txt), pre-commit 4.7.0, semgrep 1.181.0, zizmor 1.31.1, Dependabot npm updates (grouped dev/prod) (+17 more)

### Community 35 - "menubar.tsx"
Cohesion: 0.10
Nodes (10): No sizing classes on icons inside components, DropdownMenuContent(), DropdownMenuItem(), DropdownMenuPortal(), DropdownMenuRadioGroup(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+2 more)

### Community 36 - "Design Systems from DESIGN.md"
Cohesion: 0.12
Nodes (17): Contents, Coverage check, Dark mode, Design Systems from DESIGN.md, Elevation, Focus, Inputs to Confirm, Radius (+9 more)

### Community 37 - "cn"
Cohesion: 0.11
Nodes (17): Field validation and disabled states, Forms use FieldGroup + Field, @base-ui/react, class-variance-authority, cn, Checkbox(), NativeSelect(), NativeSelectProps (+9 more)

### Community 38 - "ai-elements/code-block.tsx"
Cohesion: 0.06
Nodes (30): shiki, addKeysToTokens(), CodeBlockBody, CodeBlockContent(), CodeBlockContext, CodeBlockContextType, CodeBlockCopyButton(), CodeBlockCopyButtonProps (+22 more)

### Community 39 - "Coding Standards"
Cohesion: 0.13
Nodes (16): Coding Standards, Compiler and performance boundaries, Hook dependencies and external synchronization, Integration filename convention, Internationalization, Owned component placement, Pure render and immutable inputs, Quality guard (+8 more)

### Community 40 - "@firebase-oss/ui-react"
Cohesion: 0.15
Nodes (10): firebase, @firebase-oss/ui-core, @firebase-oss/ui-react, DEFAULT_HINTS, Hint, MultiFactorAuthEnrollmentForm(), MultiFactorAuthEnrollmentFormProps, OAuthButton() (+2 more)

### Community 41 - "queue.tsx"
Cohesion: 0.05
Nodes (22): QueueItemActionProps, QueueItemActionsProps, QueueItemAttachmentProps, QueueItemContentProps, QueueItemDescriptionProps, QueueItemFileProps, QueueItemImageProps, QueueItemIndicatorProps (+14 more)

### Community 42 - "DESIGN.md"
Cohesion: 0.09
Nodes (23): Behavior, Components, Do, Do's and Don'ts, Don't, Next.js streaming and navigation presentation, Overview, Project setup (+15 more)

### Community 43 - "schema-display.tsx"
Cohesion: 0.06
Nodes (19): HttpMethod, methodStyles, SchemaDisplayBodyProps, SchemaDisplayContentProps, SchemaDisplayContext, SchemaDisplayContextType, SchemaDisplayDescriptionProps, SchemaDisplayExampleProps (+11 more)

### Community 44 - "server.ts"
Cohesion: 0.15
Nodes (18): Session flow, ref_server_only, mocks, verifyRole(), verifySession(), getAdminAuth(), FirebaseServerSession, getFirebaseServerSession() (+10 more)

### Community 46 - "stack-trace.tsx"
Cohesion: 0.08
Nodes (29): FilePathButton, FilePathButtonProps, ParsedStackTrace, parseStackFrame(), parseStackTrace(), StackFrame, StackTrace, StackTraceActions (+21 more)

### Community 47 - "toast.tsx"
Cohesion: 0.13
Nodes (6): useProfileAvatarFieldClient(), useProfileAvatar(), ACCEPTED_AVATAR_TYPES, getAvatarSource(), src_app_protected_profile_lib_avatar_max_avatar_size, Toast()

### Community 49 - "inline-citation.tsx"
Cohesion: 0.07
Nodes (19): CarouselApiContext, InlineCitationCardBodyProps, InlineCitationCardProps, InlineCitationCardTriggerProps, InlineCitationCarouselContentProps, InlineCitationCarouselHeaderProps, InlineCitationCarouselIndex(), InlineCitationCarouselIndexProps (+11 more)

### Community 50 - "audio-player.tsx"
Cohesion: 0.08
Nodes (19): media-chrome, AudioPlayerControlBarProps, AudioPlayerDurationDisplayProps, AudioPlayerElementProps, AudioPlayerMuteButtonProps, AudioPlayerPlayButton(), AudioPlayerPlayButtonProps, AudioPlayerProps (+11 more)

### Community 51 - "attachments.tsx"
Cohesion: 0.09
Nodes (27): Attachment(), AttachmentContext, AttachmentContextValue, AttachmentData, AttachmentEmptyProps, AttachmentHoverCardContentProps, AttachmentHoverCardDelays, AttachmentHoverCardProps (+19 more)

### Community 52 - "Styling & Customization"
Cohesion: 0.22
Nodes (12): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal, Prefer truncate shorthand (+4 more)

### Community 53 - "0009-integrate-firebase-authentication.md"
Cohesion: 0.12
Nodes (18): Playwright suites (E2E, a11y, visual), Custom rule catalog (GritQL, ast-grep, Semgrep), Semgrep security rules (9 rules), ADR 0009: Integrate Firebase Authentication, Firebase Auth Emulator opt-in workflow, AuthNavButton dynamic navigation, Avatar storage rules (users/{uid}/avatar), Consequences (+10 more)

### Community 54 - "speech-input.tsx"
Cohesion: 0.12
Nodes (13): detectSpeechInputMode(), SpeechInput(), SpeechInputMode, SpeechInputProps, SpeechRecognition, SpeechRecognitionAlternative, SpeechRecognitionErrorEvent, SpeechRecognitionEvent (+5 more)

### Community 55 - "ai-elements/message.tsx"
Cohesion: 0.08
Nodes (22): MessageActionProps, MessageActionsProps, MessageBranchContent(), MessageBranchContentProps, MessageBranchContext, MessageBranchContextType, MessageBranchNext(), MessageBranchNextProps (+14 more)

### Community 56 - "0007-configure-ci.md"
Cohesion: 0.11
Nodes (21): ADR 0005: Document Project Standards, Immutable ADR policy, Consequences, Context, Decision, Missing-document policy, 70% coverage thresholds, MSW deferred (+13 more)

### Community 57 - "environment-variables.tsx"
Cohesion: 0.07
Nodes (15): EnvironmentVariableContext, EnvironmentVariableContextType, EnvironmentVariableCopyButtonProps, EnvironmentVariableGroupProps, EnvironmentVariableNameProps, EnvironmentVariableProps, EnvironmentVariableRequiredProps, EnvironmentVariablesContentProps (+7 more)

### Community 58 - "mic-selector.tsx"
Cohesion: 0.07
Nodes (19): MicSelector(), MicSelectorContentProps, MicSelectorContext, MicSelectorContextType, MicSelectorEmptyProps, MicSelectorInputProps, MicSelectorItemProps, MicSelectorLabelProps (+11 more)

### Community 59 - "open-in-chat.tsx"
Cohesion: 0.09
Nodes (21): OpenInChatGPT(), OpenInChatGPTProps, OpenInClaude(), OpenInClaudeProps, OpenInContentProps, OpenInContext, OpenInCursor(), OpenInCursorProps (+13 more)

### Community 60 - "The Design System Page"
Cohesion: 0.11
Nodes (19): Block anatomy, Checklist, Color roles, Components: Tiers and Block Anatomy, Contents, Do and Don't, Edge Cases, Elevation (+11 more)

### Community 61 - "agent.tsx"
Cohesion: 0.11
Nodes (18): Agent, AgentContent, AgentContentProps, AgentHeader, AgentHeaderProps, AgentInstructions, AgentInstructionsProps, AgentOutput (+10 more)

### Community 62 - "prompt-input.test.tsx"
Cohesion: 0.19
Nodes (11): captureScreenshot(), PromptInputActionAddAttachments(), PromptInputActionAddScreenshot(), PromptInputProvider(), AttachmentNames(), DraftEditor(), SourcesEditor(), useOptionalProviderAttachments() (+3 more)

### Community 63 - "attachment.tsx"
Cohesion: 0.22
Nodes (4): Attachment(), AttachmentMedia(), attachmentMediaVariants, attachmentVariants

### Community 64 - "adr/README.md"
Cohesion: 0.09
Nodes (26): Adding a decision, ADR 0004: next-intl internationalization, ADR 0006: Testing configuration, ADR 0007: Continuous integration and quality tooling, ADR 0009: Firebase Authentication integration, ADR 0010: Electron OAuth strategy, ADR 0011: Record authenticated usage, ADR 0012: Native Firebase logging (+18 more)

### Community 65 - "sandbox.tsx"
Cohesion: 0.11
Nodes (13): TabsTrigger must be inside TabsList, SandboxContentProps, SandboxHeaderProps, SandboxRootProps, SandboxTabContentProps, SandboxTabsBarProps, SandboxTabsListProps, SandboxTabsProps (+5 more)

### Community 66 - "color-pair.tsx"
Cohesion: 0.29
Nodes (9): ColorPair(), contrast(), luminance(), toHex(), toRgb(), previewState(), StateMatrix(), Helpers (+1 more)

### Community 67 - "reasoning.tsx"
Cohesion: 0.09
Nodes (22): motion, streamdown, @streamdown/cjk, @streamdown/code, @streamdown/math, @streamdown/mermaid, Reasoning, ReasoningContent (+14 more)

### Community 68 - "question.tsx"
Cohesion: 0.10
Nodes (21): EMPTY_VALUE, getSelectedValues(), Question(), QuestionActionsProps, QuestionContext, QuestionContextValue, QuestionDescriptionProps, QuestionInput() (+13 more)

### Community 69 - "firebase-auth-basics skill"
Cohesion: 0.22
Nodes (7): firebase-auth-basics skill, Core Concepts, Firebase ID token and refresh token, Identity Providers, Prerequisites, Tokens, Users

### Community 70 - "useIsMobile"
Cohesion: 0.07
Nodes (33): Decision, react-dom, ForgotPasswordAuthFlowClient(), ForgotPasswordAuthFlowClientProps, useForgotPasswordAuthFlowClient(), ForgotPasswordPage(), instant, useAuthNavigation() (+25 more)

### Community 71 - "context.tsx"
Cohesion: 0.10
Nodes (17): tokenlens, ContextCacheUsageProps, ContextContentBodyProps, ContextContentFooterProps, ContextContentHeaderProps, ContextContentProps, ContextContext, ContextInputUsageProps (+9 more)

### Community 72 - "package-info.tsx"
Cohesion: 0.08
Nodes (14): ChangeType, changeTypeIcons, changeTypeStyles, PackageInfoChangeTypeProps, PackageInfoContentProps, PackageInfoContext, PackageInfoContextType, PackageInfoDependenciesProps (+6 more)

### Community 73 - "Component Composition"
Cohesion: 0.27
Nodes (9): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Component Composition, Contents, Empty states use Empty component, Toast notifications follow the project base (+1 more)

### Community 74 - "_lib/definitions.ts"
Cohesion: 0.33
Nodes (6): ProfileThemeField(), PreferencesState, Locale, isThemePreference(), ThemePreference, themePreferences

### Community 75 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 76 - "collapsible.tsx"
Cohesion: 0.10
Nodes (11): SourceProps, SourcesContentProps, SourcesProps, SourcesTriggerProps, TaskContentProps, TaskItemFileProps, TaskItemProps, TaskProps (+3 more)

### Community 77 - "context.test.tsx"
Cohesion: 0.20
Nodes (11): Context(), ContextCacheUsage(), ContextContentFooter(), ContextContentHeader(), ContextIcon(), ContextInputUsage(), ContextOutputUsage(), ContextReasoningUsage() (+3 more)

### Community 78 - "shadcn/ui"
Cohesion: 0.14
Nodes (14): `info` — Project information, Picking a style, Step 1: Scaffold, Component Docs, Examples, and Usage, Current Project Context, Design Systems from DESIGN.md, Detailed References, Key Fields (+6 more)

### Community 79 - "empty.tsx"
Cohesion: 0.25
Nodes (4): Use Components, Not Custom Markup → [composition.md](./rules/composition.md), Empty(), EmptyMedia(), emptyMediaVariants

### Community 80 - "user-roles.test.cjs"
Cohesion: 0.19
Nodes (10): createSetUserRoleHandler(), isRoleRequest(), roles, admin, assert, { createSetUserRoleHandler }, HttpsError, setup() (+2 more)

### Community 81 - "file-tree.tsx"
Cohesion: 0.10
Nodes (13): FileTreeActionsProps, FileTreeContext, FileTreeContextType, FileTreeFileContext, FileTreeFileContextType, FileTreeFileProps, FileTreeFolderContext, FileTreeFolderContextType (+5 more)

### Community 82 - "Assistant activity uses Trace"
Cohesion: 0.33
Nodes (11): Assistant activity uses Trace, Chat & Messaging → [chat.md](./rules/chat.md), Collapsible(), Trace(), TraceCollapsible(), TraceCollapsibleContent(), TraceCollapsibleTrigger(), TraceDescription() (+3 more)

### Community 85 - "functions/package.json"
Cohesion: 0.14
Nodes (13): dependencies, firebase-admin, firebase-functions, description, engines, node, firebase-admin, main (+5 more)

### Community 86 - "terminal.tsx"
Cohesion: 0.10
Nodes (11): ansi-to-react, TerminalActionsProps, TerminalClearButtonProps, TerminalContentProps, TerminalContext, TerminalContextType, TerminalCopyButtonProps, TerminalHeaderProps (+3 more)

### Community 87 - "index.js"
Cohesion: 0.20
Nodes (8): c_users_ianma_workspace_shadcn_firebase_template_functions_usage_logs_createusageloghandler, { createSetUserRoleHandler }, { createUsageLogHandler }, { getAuth }, { initializeApp }, logger, {
  onCall,
  onRequest,
  HttpsError,
}, firebase-admin

### Community 88 - "README.md"
Cohesion: 0.09
Nodes (32): Next.js / React / shadcn documentation workflows, Plan, implement minimal change, validate, report workflow, GitHub issues via gh CLI, MCP and skills sync workflow (agents sync), AGENTS.md Agent instructions, save skill (/save), Sources of truth, Conventional Branch 1.1.0 naming (+24 more)

### Community 89 - "complexity/native-rules.test.ts"
Cohesion: 0.17
Nodes (7): biome, categories, directories, locations, Result, root, vendorFiles

### Community 91 - "persona.tsx"
Cohesion: 0.14
Nodes (17): ADR 0003: Configure Theming, Consequences, Context, Decision, References, @rive-app/react-webgl2, getCurrentTheme(), Persona (+9 more)

### Community 92 - "review-findings.test.tsx"
Cohesion: 0.22
Nodes (8): AttachmentHoverCard(), AttachmentHoverCardContent(), AttachmentHoverCardTrigger(), ChainOfThought, ChainOfThoughtContent, Commit(), CommitContent(), CommitHeader()

### Community 93 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 94 - "Firebase Android Setup Guide"
Cohesion: 0.13
Nodes (14): 1. Check if the Android project is connected to a Firebase Project, 2. Create a new Firebase project or use an existing one, 3. Register the Android project, 4. Obtain and save `google-services.json`, 5. Add the `google-services` plugin, 6. App Check (Debug Token Persistence), Firebase Android Setup Guide, `google-services.json` file is NOT present (+6 more)

### Community 95 - "Tools"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 96 - "Application logging"
Cohesion: 0.16
Nodes (11): Next.js server error logging, Application logging, Deployment and local use, Guard behavior, Native services, Official guidance review, Viewing and controlling logs, HttpsError (+3 more)

### Community 97 - "bubble.tsx"
Cohesion: 0.39
Nodes (7): Message surfaces use Bubble, Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 98 - "@playwright/test"
Cohesion: 0.20
Nodes (8): @axe-core/playwright, @playwright/test, src_messages_es, standards, viewports, accessibilityTags, profileViewports, warmedRoutes

### Community 99 - "Flutter & Firebase Setup Guide"
Cohesion: 0.15
Nodes (12): 1. Re-running `flutterfire configure` Upon Renaming, 2. Platform-Specific Build Requirements, 3. Web CORS Best Practices, 4. Elaborating on `WidgetsFlutterBinding.ensureInitialized()`, Flutter & Firebase Setup Guide, Prerequisites, Step 1: Create a Flutter Project, Step 2: Configure Firebase (+4 more)

### Community 100 - "Firebase Local Environment Setup"
Cohesion: 0.25
Nodes (7): 1. Verify Node.js, 2. Verify Firebase CLI, 3. Verify Firebase Authentication, 4. Install Agent Skills and MCP Server, Firebase Local Environment Setup, Firebase CLI (firebase-tools), Firebase MCP Server

### Community 101 - "shadcn/SKILL.md"
Cohesion: 0.26
Nodes (3): Icons, Icons in Button use data-icon attribute, Pass icons as component objects, not string keys

### Community 102 - "chain-of-thought.tsx"
Cohesion: 0.12
Nodes (16): ChainOfThoughtContentProps, ChainOfThoughtContext, ChainOfThoughtContextValue, ChainOfThoughtHeader, ChainOfThoughtHeaderProps, ChainOfThoughtImage, ChainOfThoughtImageProps, ChainOfThoughtProps (+8 more)

### Community 103 - "button.stories.tsx"
Cohesion: 0.20
Nodes (5): @ladle/react, Sizes, Variants, Kbd(), KbdGroup()

### Community 104 - "web-preview.tsx"
Cohesion: 0.15
Nodes (13): isAllowedUrlScheme(), useWebPreview(), WebPreviewBody(), WebPreviewBodyProps, WebPreviewConsole(), WebPreviewConsoleProps, WebPreviewContext, WebPreviewContextValue (+5 more)

### Community 105 - "Agent instructions"
Cohesion: 0.12
Nodes (16): Agent instructions, Agent skills, Composition applies across runtime boundaries, Domain docs, Engineering Rules, Issue tracker, MCP & Skills, MCP & Skills workflow (+8 more)

### Community 106 - "Customization & Theming"
Cohesion: 0.14
Nodes (14): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates (+6 more)

### Community 107 - "shadcn template"
Cohesion: 0.29
Nodes (7): After creating a repository from this template, Current application behavior, Documentation, Getting Started, Learn More, shadcn template, Validation

### Community 108 - "review-findings.browser.test.tsx"
Cohesion: 0.40
Nodes (4): vitest-browser-react, src_app_globals, ArtifactAction(), Attachments()

### Community 109 - "react/native-rules.test.ts"
Cohesion: 0.29
Nodes (5): biome, directories, invalid, root, vendorFile

### Community 110 - "Colors"
Cohesion: 0.29
Nodes (7): Action & feedback, Borders & focus, Charts, Colors, Sidebar, Surfaces, Text

### Community 111 - "context-menu.tsx"
Cohesion: 0.12
Nodes (3): ContextMenu(), ContextMenuGroup(), ContextMenuItem()

### Community 112 - "Firebase Authentication Web SDK"
Cohesion: 0.13
Nodes (15): Connect to Emulator, Email Link Authentication, Firebase Authentication Web SDK, Initialization, Observe Auth State, Sign In Anonymously, Sign In with Apple (Popup), Sign In with Facebook (Popup) (+7 more)

### Community 113 - "Commands"
Cohesion: 0.12
Nodes (16): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, Contents, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode (+8 more)

### Community 114 - "logging.md"
Cohesion: 0.50
Nodes (4): App Check not enforced, src/instrumentation.ts onRequestError, recordUsage callable, withUsageGuard blocking policy

### Community 115 - "ref_node_path"
Cohesion: 0.22
Nodes (6): biome, dir, root, ref_node_child_process, ref_node_path, rulesetFilePath

### Community 116 - "ADR 0008: Install Firebase UI registry"
Cohesion: 0.13
Nodes (15): ADR 0008: Install Firebase UI registry, Alternatives considered, Amendment: Adoption of locally owned source model, Consequences, Consequences of amendment, Context, Context of amendment, Decision (+7 more)

### Community 117 - "Firebase Auth & Google Sign-In for Flutter"
Cohesion: 0.29
Nodes (7): 1. `google_sign_in` 7.2.0 API Changes, 2. Initialization & Web Hang/Crash Pitfalls, 3. Web Logout Crashes, 4. Prototyping Workaround: Bypassing Firestore Composite Indices, 5. Robust `AuthService` Boilerplate, 6. Troubleshooting `auth/unauthorized-domain` on Flutter Web, Firebase Auth & Google Sign-In for Flutter

### Community 118 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 119 - "jsx-preview.tsx"
Cohesion: 0.19
Nodes (14): react-jsx-parser, completeJsxTag(), JSXPreview, JSXPreviewContent, JSXPreviewContentProps, JSXPreviewContext, JSXPreviewContextValue, JSXPreviewError (+6 more)

### Community 120 - "conversation.tsx"
Cohesion: 0.15
Nodes (10): use-stick-to-bottom, ConversationContentProps, ConversationDownload(), ConversationDownloadProps, ConversationEmptyStateProps, ConversationProps, ConversationScrollButtonProps, defaultFormatMessage() (+2 more)

### Community 121 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, deploy, logs, serve, shell, start, test

### Community 122 - "clear.mjs"
Cohesion: 0.83
Nodes (3): clearAccounts(), reportClearError(), reportClearResult()

### Community 123 - "profile-avatar-field-client.tsx"
Cohesion: 0.24
Nodes (6): ProfileAvatarFieldClientProps, Avatar(), AvatarFallback(), AvatarImage(), FieldContent(), FieldTitle()

### Community 124 - "skills/README.md"
Cohesion: 0.12
Nodes (15): Agent configuration, Agents CLI sync workflow, Configured integrations, Installed skills, Maintenance workflow, Next.js DevTools MCP server, Serena MCP server, Source and local files (+7 more)

### Community 125 - "Registry Authoring and Addresses"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 126 - "Next.js request data and caching"
Cohesion: 0.17
Nodes (15): Async request APIs and streaming, Cache ownership and mutation consistency, Navigation state and optional features, Next.js App Router, Next.js request data and caching, Route Handlers and Server Functions, Routing, metadata, and errors, ADR 0004: Configure Internationalization (+7 more)

### Community 127 - "profile-save-button.tsx"
Cohesion: 0.60
Nodes (3): ProfileSaveButton(), ProfileSaveButtonProps, useProfileSaveButton()

### Community 128 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): ./tsconfig.json, exclude, extends

### Community 129 - "firebase-basics/references/ios_setup.md"
Cohesion: 0.33
Nodes (4): Firebase Auth iOS Setup Guide, ⛔️ CRITICAL RULE: STATE MANAGEMENT (OBSERVATION VS COMBINE) ⛔️, Firebase iOS Setup Guide, xcode-project-setup skill (SPM install)

### Community 130 - "tool.tsx"
Cohesion: 0.12
Nodes (12): CodeBlock(), SandboxHeader(), getStatusBadge(), statusIcons, statusLabels, ToolContentProps, ToolHeader(), ToolHeaderProps (+4 more)

### Community 131 - "usage-logs.test.cjs"
Cohesion: 0.21
Nodes (11): createUsageLogHandler(), events, hasEventFields(), isAllowedEvent(), { randomUUID }, assert, { createUsageLogHandler }, setup() (+3 more)

### Community 132 - "checkpoint.tsx"
Cohesion: 0.24
Nodes (6): CheckpointIconProps, CheckpointProps, CheckpointTriggerProps, Tooltip(), TooltipContent(), TooltipTrigger()

### Community 133 - "chart.tsx"
Cohesion: 0.19
Nodes (11): recharts, ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 134 - "artifact.tsx"
Cohesion: 0.12
Nodes (8): ArtifactActionProps, ArtifactActionsProps, ArtifactCloseProps, ArtifactContentProps, ArtifactDescriptionProps, ArtifactHeaderProps, ArtifactProps, ArtifactTitleProps

### Community 135 - "stryker.config.json"
Cohesion: 0.14
Nodes (13): commandRunner, command, concurrency, coverageAnalysis, ignorePatterns, mutate, reporters, $schema (+5 more)

### Community 136 - "app-router-imports.test.ts"
Cohesion: 0.33
Nodes (4): biome, directories, root, vendorFile

### Community 137 - "Authentication in Security Rules"
Cohesion: 0.18
Nodes (10): Authentication in Security Rules, Basic Checks, Check if user is signed in, Check if user owns the data, Check if user owns the document (field-based), Example: Email Verification Check, Token Properties, firebase-storage-basics skill (+2 more)

### Community 138 - "Refresh Antigravity Local Environment"
Cohesion: 0.24
Nodes (7): Refresh Android Studio Local Environment, Refresh Antigravity Local Environment, Refresh Gemini CLI Local Environment, firebase/agent-skills repository, Firebase skills install via npx skills add, gemini extensions update firebase, npx skills CLI (add/list/update)

### Community 139 - "Base vs Radix"
Cohesion: 0.25
Nodes (8): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Contents, Select, Select — multiple selection and object values (base only), Slider, ToggleGroup

### Community 140 - "drawer.tsx"
Cohesion: 0.14
Nodes (6): Dialog, Sheet, and Drawer always need a Title, DrawerContent(), DrawerContext, DrawerContextProps, DrawerTitle(), useDrawer()

### Community 141 - "Firebase Authentication - Android Setup Guide (Kotlin)"
Cohesion: 0.17
Nodes (12): 1. Enable Authentication via CLI, 2. Add dependencies to Gradle build files, 3. Initialize FirebaseAuth, 4. Check current Auth state, 5. Use sign-in providers in the app, 6. Sign out users, Email/Password, Firebase Authentication - Android Setup Guide (Kotlin) (+4 more)

### Community 142 - "Badge"
Cohesion: 0.60
Nodes (3): Badge(), badgeVariants, Variants

### Community 143 - "ui/code-block.tsx"
Cohesion: 0.20
Nodes (5): Code and tool output use CodeBlock, CodeBlock(), CodeBlockLine(), codeBlockLineVariants, codeBlockVariants

### Community 144 - "confirmation.tsx"
Cohesion: 0.10
Nodes (19): ConfirmationAccepted(), ConfirmationAcceptedProps, ConfirmationActionProps, ConfirmationActions(), ConfirmationActionsProps, ConfirmationContext, ConfirmationContextValue, ConfirmationProps (+11 more)

### Community 145 - "item.tsx"
Cohesion: 0.18
Nodes (5): Item(), ItemActions(), ItemMedia(), itemMediaVariants, itemVariants

### Community 146 - "Antigravity Setup"
Cohesion: 0.40
Nodes (4): 1. Install and Verify Firebase Skills, 2. Configure and Verify Firebase MCP Server, 3. Restart and Verify Connection, Antigravity Setup

### Community 147 - "Composition: asChild (radix) vs render (base)"
Cohesion: 0.13
Nodes (9): Composition: asChild (radix) vs render (base), AlertDialogTrigger(), Breadcrumb(), BreadcrumbLink(), DialogClose(), DialogTrigger(), DropdownMenuTrigger(), SheetClose() (+1 more)

### Community 149 - "ref_node_fs"
Cohesion: 0.25
Nodes (5): biome, dir, root, authEmulatorEndpoint, ref_node_fs

### Community 152 - "Component Selection"
Cohesion: 0.31
Nodes (13): Known traps, Choosing between overlay components, No manual z-index on overlay components, Component Selection, AlertDialog(), Command(), Dialog(), Drawer() (+5 more)

### Community 154 - "Reference"
Cohesion: 0.40
Nodes (4): Files, Implementation vs Review, Reference, Steps

### Community 157 - "ctx7 CLI"
Cohesion: 0.12
Nodes (16): Authentication, Documentation Commands, Result fields, Selection process, Step 1: Resolve a Library, Step 2: Query Documentation, Version-specific IDs, Writing good queries (+8 more)

### Community 158 - "Issue tracker: GitHub"
Cohesion: 0.06
Nodes (30): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary, Conventions, Issue tracker: GitHub, Pull requests as a triage surface (+22 more)

### Community 159 - "biome.preview.json"
Cohesion: 0.20
Nodes (9): assist, enabled, formatter, enabled, linter, rules, plugins, preset (+1 more)

### Community 160 - "Contributing"
Cohesion: 0.12
Nodes (16): Before opening a pull request, Branches, Commit hook environment failures, Commits, Contributing, Merging into main, Next.js documentation and framework changes, React documentation and runtime changes (+8 more)

### Community 163 - "questionnaire.tsx"
Cohesion: 0.09
Nodes (12): react-day-picker, @shadcn/react, NotFound(), ProfileBackToHomeButton(), ProfileBackToHomeButtonProps, buttonVariants, Calendar(), QuestionnaireNext() (+4 more)

### Community 164 - "next-intl"
Cohesion: 0.10
Nodes (17): Provider(), ladle_ladle, authEmulatorHost, nextConfig, withNextIntl, next, next-intl, ErrorPage() (+9 more)

### Community 165 - "utils.ts"
Cohesion: 0.13
Nodes (8): defaultStates, @xyflow/react, CanvasProps, deleteKeyCode, ControlsProps, PanelProps, ToolbarProps, src_lib_utils_cn

### Community 168 - "Ask Matt"
Cohesion: 0.11
Nodes (18): ask-matt OpenAI interface config, Continue, clear, handoff, subagent, compact options, Phase boundaries, Primary and secondary sources, The five options, The tree, These are judgement calls, ask-matt skill (+10 more)

### Community 169 - "⛔️ CRITICAL RULE: INITIALIZATION ORDER ⛔️"
Cohesion: 0.29
Nodes (7): 1. Create a Firebase Project and App (Automated), 2. Installation (Automated via Swift Package Manager CLI), 3. Initialization, 4. App Check (Debug Token Persistence), AppDelegate (Traditional / UIKit), ⛔️ CRITICAL RULE: INITIALIZATION ORDER ⛔️, SwiftUI (Modern - SAFE PATTERN)

### Community 172 - "routing.ts"
Cohesion: 0.10
Nodes (22): Internationalization, ADR 0006: Configure testing, Consequences, Context, Decision, References, fast-check, ProfileLocaleField() (+14 more)

### Community 174 - "Firebase Web Setup Guide"
Cohesion: 0.29
Nodes (6): 1. Create a Firebase Project and App, 2. Installation, 3. Initialization, 4. Using Services, 5. App Check (Debug Token Persistence), Firebase Web Setup Guide

### Community 184 - "navigation-menu.tsx"
Cohesion: 0.25
Nodes (3): NavigationMenuLink(), NavigationMenuTrigger(), navigationMenuTriggerStyle

### Community 185 - "Recommended: Global Setup"
Cohesion: 0.33
Nodes (5): 1. Install and Verify Firebase Skills, 2. Configure and Verify Firebase MCP Server, 3. Restart and Verify Connection, GitHub Copilot Setup, Recommended: Global Setup

### Community 187 - "⛔️ CRITICAL RULE: NO INLINE INITIALIZATION ⛔️"
Cohesion: 0.29
Nodes (7): 1. Import and Initialize, 2. Authentication State, 3. Email and Password Authentication (Modern Concurrency), 4. Sign Out, ⛔️ CRITICAL RULE: NO INLINE INITIALIZATION ⛔️, Sign In, Sign Up

### Community 188 - "firebase-basics/SKILL.md"
Cohesion: 0.13
Nodes (10): Exploring Commands, Initialization, Refresh Other Local Environment, Android Studio Setup, MCP Setup, Skills Installation, Common Issues, Firebase Usage Principles (+2 more)

### Community 194 - "cspell.json"
Cohesion: 0.25
Nodes (7): ignorePaths, import, language, $schema, useGitignore, version, words

### Community 199 - "Recommended: Global Setup"
Cohesion: 0.33
Nodes (5): 1. Install and Verify Firebase Skills, 2. Configure and Verify Firebase MCP Server, 3. Restart and Verify Connection, Other Agents Setup, Recommended: Global Setup

### Community 200 - "TooltipProvider"
Cohesion: 0.29
Nodes (7): ADR 0007: Configure CI, Alternatives considered, Consequences, Context, Decision, References, TooltipProvider()

### Community 204 - "field.tsx"
Cohesion: 0.14
Nodes (18): @hookform/resolvers, react-hook-form, ProfileDisplayNameFieldProps, ProfileEmailFieldProps, EmailLinkAuthForm(), ForgotPasswordAuthForm(), Policies(), SignInAuthForm() (+10 more)

### Community 205 - "ai"
Cohesion: 0.17
Nodes (9): ai, @radix-ui/react-use-controllable-state, ImageProps, TranscriptionContext, TranscriptionContextValue, TranscriptionProps, TranscriptionSegment, TranscriptionSegmentProps (+1 more)

### Community 207 - "Alternative: Manual MCP Configuration (Project Scope)"
Cohesion: 0.25
Nodes (7): 1. Configure and Verify Firebase MCP Server, 1. Install and Verify Firebase Extension, 2. Restart and Verify Connection, 2. Restart and Verify Connection, Alternative: Manual MCP Configuration (Project Scope), Gemini CLI Setup, Recommended: Installing Extensions

### Community 211 - "marker.tsx"
Cohesion: 0.53
Nodes (5): System notes and dividers use Marker, Marker(), MarkerContent(), MarkerIcon(), markerVariants

### Community 213 - "coverage.md"
Cohesion: 0.06
Nodes (31): Changes from this audit, Documentation coverage, Firebase and design context, Next.js, React, Scope and evidence, shadcn/ui, Sources and maintenance (+23 more)

### Community 216 - "Workflow"
Cohesion: 0.33
Nodes (6): 1. Provisioning, 2. Client Setup & Usage, 3. Security Rules, Option 1. Enabling Authentication via CLI, Option 2. Enabling Authentication in Console, Workflow

### Community 217 - "edge.tsx"
Cohesion: 0.47
Nodes (4): Animated(), Edge, getEdgeParams(), getHandleCoordsByPosition()

### Community 219 - "Recommended Method: Using Plugins"
Cohesion: 0.40
Nodes (4): 1. Install and Verify Plugins, 2. Restart and Verify Connection, Claude Code Setup, Recommended Method: Using Plugins

### Community 220 - "Cursor Setup"
Cohesion: 0.40
Nodes (4): 1. Install and Verify Firebase Skills, 2. Configure and Verify Firebase MCP Server, 3. Restart and Verify Connection, Cursor Setup

### Community 223 - ".fallowrc.json"
Cohesion: 0.33
Nodes (5): entry, health, ignore, ignorePatterns, $schema

### Community 246 - "use-profile-submit.ts"
Cohesion: 0.18
Nodes (12): ProfileFormClient(), ProfileFormClientProps, useProfileFormClient(), useProfileSaveFeedback(), UseProfileSaveFeedbackOptions, useProfileSessionContext(), useProfileSubmit(), UseProfileSubmitOptions (+4 more)

### Community 247 - "doctor.config.json"
Cohesion: 0.50
Nodes (3): ignore, files, $schema

### Community 248 - "create-next-app default starter assets"
Cohesion: 0.67
Nodes (4): create-next-app default starter assets, Globe icon (grey wireframe globe, 16x16 SVG), Next.js wordmark logo (black SVG), Vercel triangle logo (white SVG)

### Community 445 - "showcase-coverage.mjs"
Cohesion: 0.29
Nodes (6): components, missing, source, [uiArg, ...roots], uiDir, walk()

### Community 446 - "PromptInput"
Cohesion: 0.50
Nodes (4): convertBlobUrlToDataUrl(), PromptInput(), PromptInputTextarea(), useOptionalPromptInputController()

## Ambiguous Edges - Review These
- `Native Biome rule evaluation history` → `Boolean UI phase flags instead of status tag`  [AMBIGUOUS]
  CODING_STANDARDS.md · relation: conceptually_related_to

## Knowledge Gaps
- **1596 isolated node(s):** `AccessSubscriptionOptions`, `SessionHandlerState`, `warmedRoutes`, `accessibilityTags`, `profileViewports` (+1591 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2222 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **170 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Native Biome rule evaluation history` and `Boolean UI phase flags instead of status tag`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `prompt-input.tsx`, `home-hero.tsx`, `Button`, `Items always inside their Group component`, `node.tsx`, `lib/navigation.ts`, `profile-section-client.tsx`, `lucide-react`, `plan.tsx`, `commit.tsx`, `test-results.tsx`, `button.tsx`, `package.json`, `sidebar.tsx`, `voice-selector.tsx`, `use-profile-session.ts`, `client.ts`, `menubar.tsx`, `cn`, `ai-elements/code-block.tsx`, `@firebase-oss/ui-react`, `queue.tsx`, `schema-display.tsx`, `alert-dialog.tsx`, `stack-trace.tsx`, `toast.tsx`, `inline-citation.tsx`, `audio-player.tsx`, `attachments.tsx`, `speech-input.tsx`, `ai-elements/message.tsx`, `environment-variables.tsx`, `mic-selector.tsx`, `open-in-chat.tsx`, `agent.tsx`, `attachment.tsx`, `sandbox.tsx`, `color-pair.tsx`, `reasoning.tsx`, `question.tsx`, `useIsMobile`, `context.tsx`, `package-info.tsx`, `_lib/definitions.ts`, `collapsible.tsx`, `file-tree.tsx`, `Assistant activity uses Trace`, `pagination.tsx`, `terminal.tsx`, `persona.tsx`, `bubble.tsx`, `chain-of-thought.tsx`, `web-preview.tsx`, `context-menu.tsx`, `carousel.tsx`, `jsx-preview.tsx`, `conversation.tsx`, `profile-avatar-field-client.tsx`, `profile-save-button.tsx`, `tool.tsx`, `checkpoint.tsx`, `chart.tsx`, `artifact.tsx`, `drawer.tsx`, `ui/code-block.tsx`, `confirmation.tsx`, `item.tsx`, `Composition: asChild (radix) vs render (base)`, `questionnaire.tsx`, `next-intl`, `utils.ts`, `table.tsx`, `field.tsx`, `ai`, `marker.tsx`, `ui/message.tsx`, `use-profile-submit.ts`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `checkpoint.tsx`, `Items always inside their Group component`, `artifact.tsx`, `node.tsx`, `Base vs Radix`, `lucide-react`, `plan.tsx`, `commit.tsx`, `confirmation.tsx`, `ui/code-block.tsx`, `button.tsx`, `sidebar.tsx`, `Component Selection`, `voice-selector.tsx`, `menubar.tsx`, `next-intl`, `questionnaire.tsx`, `ai-elements/code-block.tsx`, `@firebase-oss/ui-react`, `queue.tsx`, `alert-dialog.tsx`, `stack-trace.tsx`, `toast.tsx`, `attachments.tsx`, `speech-input.tsx`, `ai-elements/message.tsx`, `environment-variables.tsx`, `mic-selector.tsx`, `open-in-chat.tsx`, `attachment.tsx`, `question.tsx`, `context.tsx`, `field.tsx`, `Assistant activity uses Trace`, `pagination.tsx`, `terminal.tsx`, `button.stories.tsx`, `web-preview.tsx`, `review-findings.browser.test.tsx`, `carousel.tsx`, `conversation.tsx`, `profile-avatar-field-client.tsx`, `profile-save-button.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `shadcn/ui` connect `shadcn/ui` to `Component Selection`, `Button`, `shadcn/SKILL.md`, `react`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Button()` (e.g. with `Known traps` and `Step 5: Map Component Recipes to Variants`) actually correct?**
  _`Button()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AccessSubscriptionOptions`, `SessionHandlerState`, `warmedRoutes` to the rest of the system?**
  _1596 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `prompt-input.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02631578947368421 - nodes in this community are weakly interconnected._