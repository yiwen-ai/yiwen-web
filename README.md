# 亿文 yiwen.ai

## Development

Go forward to the specific package directory and read the README.md there.

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Deployment

### Web

```shell
pnpm install
pnpm --filter web run build # build for production (.env.production applied)
pnpm --filter web run build --mode testing # build for testing (.env.testing applied)
pnpm --filter web run build --mode staging # build for staging (.env.staging applied)
# then deploy the `packages/web/dist` directory
```

### Component Library

```shell
pnpm install
pnpm --filter component run build
# then deploy the `packages/component/storybook-static` directory
```
