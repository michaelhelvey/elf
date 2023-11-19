<p align="center">
  <a href="https://michaelhelvey.dev" target="blank"><img src="./public/goblincore_stack.png" width="200" alt="goblin coding in a dark cave" /></a>
</p>

# remix-goblincore-stack

Personal [Remix](https://remix.run) stack for side-projects.

**Stack**:

-   [drizzle orm](https://orm.drizzle.team/)
-   [fly.io postgres](https://fly.io/docs/postgres/)
-   [tailwindcss](https://tailwindcss.com/)
-   [shadcn/ui](https://ui.shadcn.com/)
-   [clerk](https://clerk.com)

And other standard JS tooling.

## Getting Started

-   `pnpm local-setup`
-   `pnpm dev`

This will start a local development server at `http://localhost:3000`

### Development Tasks

-   `pnpm run test`
-   `pnpm run test:e2e`
-   `pnpm run lint`
-   `pnpm run format`
-   `pnpm validate` (runs everything all at once)

### Deployment

-   Automatically deploys to [fly.io](https://fly.io) on push to the `master` branch.

## Credits

-   Maintained by [Michael Helvey](https://michaelhelvey.dev)
-   Top image by [PixArt-alpha 1024px](https://github.com/PixArt-alpha/PixArt-alpha)

## License

MIT
