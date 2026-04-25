export interface NxProjectNode {
  name: string;
  type: 'app' | 'lib' | 'e2e' | string;
  data: {
    root: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

export interface NxDependency {
  source: string;
  target: string;
  type: 'static' | 'implicit' | string;
}

export interface NxGraph {
  nodes: Record<string, NxProjectNode>;
  dependencies: Record<string, NxDependency[]>;
}

export interface NxGraphJson {
  graph: NxGraph;
}

export interface GraphToMermaidOptions {
  direction?: 'TD' | 'LR' | 'BT' | 'RL';
}

/**
 * Converts an Nx project graph JSON output to a Mermaid markdown diagram.
 *
 * @param graphJson - The Nx graph JSON object (output of `nx graph --file`)
 * @param options - Optional configuration for the Mermaid diagram
 * @returns A Mermaid markdown string
 */
export function graphToMermaid(
  graphJson: NxGraphJson,
  options: GraphToMermaidOptions = {},
): string {
  const { direction = 'TD' } = options;
  const { nodes, dependencies } = graphJson.graph;

  const lines: string[] = [`graph ${direction}`];

  // Add node definitions with labels based on type
  for (const [id, node] of Object.entries(nodes)) {
    const safeId = sanitizeId(id);
    const label = node.name;
    const shape = getNodeShape(node.type);
    lines.push(`  ${safeId}${shape.open}"${label}"${shape.close}`);
  }

  // Track unique edges to avoid duplicates (same source/target pair with different types)
  const seenEdges = new Set<string>();

  for (const deps of Object.values(dependencies)) {
    for (const dep of deps) {
      const edgeKey = `${dep.source}-->${dep.target}`;
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey);
        const sourceId = sanitizeId(dep.source);
        const targetId = sanitizeId(dep.target);
        lines.push(`  ${sourceId} --> ${targetId}`);
      }
    }
  }

  return lines.join('\n');
}

function sanitizeId(id: string): string {
  // Replace characters that are not valid in Mermaid node IDs
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

interface NodeShape {
  open: string;
  close: string;
}

function getNodeShape(type: string): NodeShape {
  switch (type) {
    case 'app':
      return { open: '([', close: '])' };
    case 'e2e':
      return { open: '{{', close: '}}' };
    case 'lib':
    default:
      return { open: '[', close: ']' };
  }
}
