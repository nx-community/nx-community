import { describe, it, expect } from "vitest";
import { graphToMermaid, type NxGraphJson } from "./graph-to-mermaid";

const simpleGraph: NxGraphJson = {
  graph: {
    nodes: {
      "app-a": {
        name: "app-a",
        type: "app",
        data: { root: "apps/app-a" },
      },
      "lib-b": {
        name: "lib-b",
        type: "lib",
        data: { root: "libs/lib-b" },
      },
      "lib-c": {
        name: "lib-c",
        type: "lib",
        data: { root: "libs/lib-c" },
      },
    },
    dependencies: {
      "app-a": [
        { source: "app-a", target: "lib-b", type: "static" },
        { source: "app-a", target: "lib-c", type: "static" },
      ],
      "lib-b": [{ source: "lib-b", target: "lib-c", type: "static" }],
      "lib-c": [],
    },
  },
};

const graphWithE2e: NxGraphJson = {
  graph: {
    nodes: {
      "my-app": {
        name: "my-app",
        type: "app",
        data: { root: "apps/my-app" },
      },
      "my-app-e2e": {
        name: "my-app-e2e",
        type: "e2e",
        data: { root: "apps/my-app-e2e" },
      },
      "shared-lib": {
        name: "shared-lib",
        type: "lib",
        data: { root: "libs/shared-lib" },
      },
    },
    dependencies: {
      "my-app": [{ source: "my-app", target: "shared-lib", type: "static" }],
      "my-app-e2e": [
        { source: "my-app-e2e", target: "my-app", type: "implicit" },
      ],
      "shared-lib": [],
    },
  },
};

const graphWithDuplicateDeps: NxGraphJson = {
  graph: {
    nodes: {
      "project-a": {
        name: "project-a",
        type: "lib",
        data: { root: "libs/project-a" },
      },
      "project-b": {
        name: "project-b",
        type: "lib",
        data: { root: "libs/project-b" },
      },
    },
    dependencies: {
      "project-a": [
        { source: "project-a", target: "project-b", type: "static" },
        { source: "project-a", target: "project-b", type: "implicit" },
      ],
      "project-b": [],
    },
  },
};

const emptyGraph: NxGraphJson = {
  graph: {
    nodes: {},
    dependencies: {},
  },
};

describe("graphToMermaid", () => {
  it("should convert a simple graph to Mermaid markdown snapshot", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toMatchSnapshot();
  });

  it("should convert a graph with e2e projects to Mermaid markdown snapshot", () => {
    const result = graphToMermaid(graphWithE2e);
    expect(result).toMatchSnapshot();
  });

  it("should deduplicate edges with the same source and target snapshot", () => {
    const result = graphToMermaid(graphWithDuplicateDeps);
    expect(result).toMatchSnapshot();
  });

  it("should convert an empty graph to Mermaid markdown snapshot", () => {
    const result = graphToMermaid(emptyGraph);
    expect(result).toMatchSnapshot();
  });

  it("should support left-to-right direction", () => {
    const result = graphToMermaid(simpleGraph, { direction: "LR" });
    expect(result).toMatchSnapshot();
  });

  it("should start with graph direction declaration", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toMatch(/^graph TD/);
  });

  it("should include all nodes", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toContain('"app-a"');
    expect(result).toContain('"lib-b"');
    expect(result).toContain('"lib-c"');
  });

  it("should include all edges", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toContain("app-a --> lib-b");
    expect(result).toContain("app-a --> lib-c");
    expect(result).toContain("lib-b --> lib-c");
  });

  it("should use stadium shape for app nodes", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toContain('app-a(["app-a"])');
  });

  it("should use rectangle shape for lib nodes", () => {
    const result = graphToMermaid(simpleGraph);
    expect(result).toContain('lib-b["lib-b"]');
  });

  it("should use hexagon shape for e2e nodes", () => {
    const result = graphToMermaid(graphWithE2e);
    expect(result).toContain('my-app-e2e{{"my-app-e2e"}}');
  });

  it("should deduplicate edges with the same source and target", () => {
    const result = graphToMermaid(graphWithDuplicateDeps);
    const edgeCount = (result.match(/project-a --> project-b/g) || []).length;
    expect(edgeCount).toBe(1);
  });
});
