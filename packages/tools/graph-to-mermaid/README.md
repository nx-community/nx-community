# @nx-community/nx-graph-to-mermaid

A CLI tool and library that converts [Nx](https://nx.dev) project graph JSON output to [Mermaid](https://mermaid.js.org) markdown diagrams.

Use it in CI pipelines (e.g. GitHub Actions) to visualize your Nx project graph in pull request summaries.

## Installation

```sh
npm install @nx-community/nx-graph-to-mermaid
```

## CLI Usage

Generate an Nx graph JSON file and pipe it through `nx-graph-to-mermaid`:

```sh
# Generate the graph JSON and convert to Mermaid
nx graph --file=graph.json
nx-graph-to-mermaid graph.json

# Or pipe from stdin
nx graph --file=- | nx-graph-to-mermaid

# Choose a different graph direction (TD, LR, BT, RL)
nx-graph-to-mermaid --direction=LR graph.json

# Wrap output in a Mermaid fenced code block
nx-graph-to-mermaid --block graph.json
```

### GitHub Actions Example

```yaml
- name: Generate Nx Graph as Mermaid
  run: |
    nx graph --file=graph.json
    npx nx-graph-to-mermaid --block graph.json >> $GITHUB_STEP_SUMMARY
```

## Library Usage

```typescript
import { graphToMermaid } from "@nx-community/nx-graph-to-mermaid";
import { readFileSync } from "node:fs";

const graphJson = JSON.parse(readFileSync("graph.json", "utf-8"));
const mermaid = graphToMermaid(graphJson);
console.log(mermaid);
// graph TD
//   app-a(["app-a"])
//   lib-b["lib-b"]
//   app-a --> lib-b
```

### API

#### `graphToMermaid(graphJson, options?)`

Converts an Nx project graph JSON object to a Mermaid markdown string.

| Parameter           | Type                           | Description                                     |
| ------------------- | ------------------------------ | ----------------------------------------------- |
| `graphJson`         | `NxGraphJson`                  | The Nx graph JSON (output of `nx graph --file`) |
| `options.direction` | `'TD' \| 'LR' \| 'BT' \| 'RL'` | Graph direction (default: `'TD'`)               |

## Building

Run `nx build graph-to-mermaid` to build the library.

## Running unit tests

Run `nx test graph-to-mermaid` to execute the unit tests via [Vitest](https://vitest.dev/).
