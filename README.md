# Elf

The easiest way to share wishlists online

## Getting Started

**System dependencies**

-   Python 3.11+
-   Node.js LTS
-   PNPM
-   [just](https://github.com/casey/just)

## Local Development

Starting the project:

`just`

This will load Django and the required static files in development mode. Everything will automatically reload / recompile on change.

For other useful development commands, look at the `scripts` in pnpm, along with the tasks in the `justfile`

## Deployment

CI will run with Github Actions, and deploy to Fly by default on a push to `master`.
