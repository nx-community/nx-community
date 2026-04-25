#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import {
  graphToMermaid,
  type NxGraphJson,
  type GraphToMermaidOptions,
} from '../index';

function printUsage(): void {
  console.log(`
Usage: graph-to-mermaid [options] [file]

Converts an Nx graph JSON output to a Mermaid markdown diagram.

Arguments:
  file          Path to the Nx graph JSON file (uses stdin if not provided)

Options:
  --direction   Graph direction: TD (top-down), LR (left-right),
                BT (bottom-top), RL (right-left) [default: TD]
  --help        Show this help message

Examples:
  nx graph --file=graph.json && graph-to-mermaid graph.json
  nx graph --file=graph.json && graph-to-mermaid --direction=LR graph.json
  nx graph --file=- | graph-to-mermaid
`);
}

function parseArgs(argv: string[]): {
  file?: string;
  options: GraphToMermaidOptions;
  help: boolean;
} {
  const args = argv.slice(2);
  let file: string | undefined;
  let help = false;
  const options: GraphToMermaidOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--direction' || arg === '-d') {
      const direction = args[++i] as GraphToMermaidOptions['direction'];
      if (!['TD', 'LR', 'BT', 'RL'].includes(direction ?? '')) {
        console.error(
          `Error: Invalid direction "${direction}". Must be one of: TD, LR, BT, RL`,
        );
        process.exit(1);
      }
      options.direction = direction;
    } else if (arg?.startsWith('--direction=')) {
      const direction = arg.split('=')[1] as GraphToMermaidOptions['direction'];
      if (!['TD', 'LR', 'BT', 'RL'].includes(direction ?? '')) {
        console.error(
          `Error: Invalid direction "${direction}". Must be one of: TD, LR, BT, RL`,
        );
        process.exit(1);
      }
      options.direction = direction;
    } else if (!arg?.startsWith('-')) {
      file = arg;
    }
  }

  return { file, options, help };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf-8')),
    );
    process.stdin.on('error', reject);
  });
}

async function main(): Promise<void> {
  const { file, options, help } = parseArgs(process.argv);

  if (help) {
    printUsage();
    process.exit(0);
  }

  let rawJson: string;

  try {
    if (file && file !== '-') {
      rawJson = readFileSync(file, 'utf-8');
    } else {
      rawJson = await readStdin();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error reading input: ${message}`);
    process.exit(1);
  }

  let graphJson: NxGraphJson;

  try {
    graphJson = JSON.parse(rawJson) as NxGraphJson;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error parsing JSON: ${message}`);
    process.exit(1);
  }

  if (!graphJson.graph) {
    console.error(
      'Error: Invalid Nx graph JSON. Expected a "graph" property at the root.',
    );
    process.exit(1);
  }

  const mermaid = graphToMermaid(graphJson, options);
  console.log(mermaid);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unexpected error: ${message}`);
  process.exit(1);
});
