# Pathuko

Turn large AI-generated code changes into an interactive visual story so developers can understand what changed, why it matters, and what deserves attention.

> AI writes. Your extension explains. Developer decides.

## Features

- Local Git analysis of staged and unstaged changes relative to `HEAD`
- Deterministic file classification, importance scoring, story grouping, and risk flags
- Visual change map and ranked stories inside VS Code
- Click any affected file to open it in the editor
- Open the native Git diff from the story view
- Simple, medium, and deep explanation architecture ready for an optional provider
- Workspace change watcher with configurable thresholds
- VS Code light and dark theme support

## Install and use

```sh
npm install
npm run compile
npm run package
code --install-extension ai-change-story-0.1.0.vsix
```

Launch with `F5` to open an Extension Development Host, then run **Paathutu: Open Overview** from the Command Palette. The extension needs an open Git workspace with changes relative to `HEAD`.

## Architecture

`gitService` collects Git data through the public Git CLI. `changeAnalyzer` builds typed file changes. Classifier, importance, risk, and story analyzers remain deterministic and local. `IChangeIntelligenceProvider` separates future, consent-based LLM explanations from the default `LocalChangeIntelligenceProvider`. The WebviewPanel is an abstraction layer; the original code and native diff remain available.

## Privacy

Your code stays local unless you explicitly configure an external AI provider. This version does not transmit source code or contain API keys.

## Settings

`aiChangeStory.autoDetect`, `autoAnalyzeThreshold`, `showNotifications`, `defaultDetailLevel`, `enableRiskAnalysis`, `enableLLM`, `llmProvider`, and `excludePatterns` are available in VS Code settings. Exclude patterns are manifest-ready; filtering can be expanded as analysis grows.

## Development

```sh
npm install
npm run compile
npm test
npm run watch
npm run package
```

Tests cover classification, weighted importance, and a 2,000-file performance fixture. There are no fake screenshots; a future screenshot can be added at `docs/demo.png`.

## Known limitations

Git collection currently uses `git diff HEAD`, which combines staged and unstaged changes and requires the `git` executable. Binary files and unsupported languages are safely represented as file-level changes without AST symbols. Git's public VS Code extension API is not guaranteed to be available, so native diff opening falls back to the Git command surface. The LLM provider interface is intentionally unimplemented until explicit consent and provider configuration are designed.
