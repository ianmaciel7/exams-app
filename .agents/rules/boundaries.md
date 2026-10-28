---
trigger: model_decision
description: "Read when changing runtime import graphs, Server Components, Server Functions, or data crossing runtime boundaries."
---

# Server and client boundaries

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing runtime import graphs, Server Components, Server Functions, or data crossing runtime boundaries.

## Server Components and Server Functions

Server Components can read authorized private server resources, be async for
data reading, render Client Components, and contribute initial HTML. They do
not use client state/Effects or interactive event handlers and cannot access
browser APIs. Client Components support those interactive hooks/handlers, may
also contribute server-rendered initial HTML, and access browser APIs only
when executing in the browser.

`"use client"` marks a module-graph boundary. Keep transitive imports safe and
pass server-rendered content through composition slots rather than importing
server implementations into client code. `"use server"` marks asynchronous
Server Functions; it is not a generic Server Component directive and does not
perform validation, authentication, or authorization for the implementation.

Validate each remotely received argument and each caller's permissions. Keep
credentials/private resources on the server and respect serialization/transport
contracts. Do not infer server Context support from the version-history
summary without checking the concrete API and framework.

Client directives mark import-graph boundaries, not an absence of server prerendering.
Browser integrations declare `"use client"`; server integrations import `"server-only"`.
Never import server-only APIs directly from client modules. Do not infer the whole
runtime graph from a filename or directive alone.

Follow [components.md](components.md) for integration suffixes and
[auth.md](auth.md) for protected server operations. The framework owns application
roots, hydration, compilation, and server rendering; isolated React DOM recipes
do not authorize replacing that pipeline.
