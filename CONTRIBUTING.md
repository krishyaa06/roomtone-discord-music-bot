# Contributing to roomtone-discord-music-bot

Thanks for taking the time to contribute! roomtone-discord-music-bot is a project by [Prism Protocol](https://github.com/krishyaa06).

## Getting started

```bash
git clone https://github.com/krishyaa06/roomtone-discord-music-bot.git
cd roomtone-discord-music-bot
pnpm install
cp .env.example .env   # fill in your own values — never commit .env
```

## Before you open a pull request

Make sure everything passes locally:

```bash
pnpm run typecheck
pnpm run build
```

## Guidelines

- Keep pull requests small and focused — one feature or fix per PR.
- Update the README when you change behaviour, flags or options.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add --json output
fix: handle empty input
docs: clarify install steps
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `ci`. Add a short entry under **[Unreleased]** in [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

## Reporting bugs & ideas

Open an [issue](https://github.com/krishyaa06/roomtone-discord-music-bot/issues) with:

- what you expected vs. what happened
- steps to reproduce
- your OS, browser or Node.js version

**Security issues:** please don't open a public issue — contact the maintainer privately via [GitHub](https://github.com/krishyaa06).

## License

By contributing, you agree that your contributions will be licensed under the project's [license](LICENSE).
