# 亿文 yiwen.ai

## Development

Go forward to the specific package directory and read the README.md there.

### Before Installing Dependencies

Add the TipTap token to your `~/.npmrc` file, which is used to install the TipTap Pro packages, you can get the token from @zensh (严老师).

```ini
; ~/.npmrc
//registry.tiptap.dev/:_authToken=[Put the TipTap token here]
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Deployment

### Web

```shell
pnpm install
pnpm --filter web run build --mode=testing --base=https://cdn.yiwen.pub/dev/assets # build for testing (.env.testing applied)
pnpm --filter web run build --mode=staging --base=https://cdn.yiwen.pub/assets # build for staging (.env.staging applied)
pnpm --filter web run build --mode=production --base=https://cdn.yiwen.pub/assets # build for production (.env.production applied)
# then deploy all the files in the `packages/web/dist` directory
```

### Component Library

```shell
pnpm install
pnpm --filter component run build
# then deploy all the files in the `packages/component/storybook-static` directory
```
