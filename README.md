# Django Goblincore Stack

My opinionated personal stack for building [Django](https://www.django-project.com) projects.

## Getting Started

**System dependencies**

-   Python 3.11+
-   Node.js LTS
-   PNPM
-   [just](https://github.com/casey/just)

**Starting a new project**

To start a new project, run `npx degit michaelhelvey/django-goblincore-stack <your-project-name>`
Then run `just install`.

Then change `django-goblincore-stack` throughout the app to your project name.

## Local Development

Starting the project:

`just`

This will load Django and the required static files in development mode. Everything will automatically reload / recompile on change.

For other useful development commands, look at the `scripts` in pnpm, along with the tasks in the `justfile`

## Deployment

CI will run with Github Actions, and deploy to Fly by default on a push to `master`.
