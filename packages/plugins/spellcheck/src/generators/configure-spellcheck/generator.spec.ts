import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, addProjectConfiguration, getProjects } from "@nx/devkit";
import { configureSpellcheckGenerator } from "./generator";
import { ConfigureSpellcheckGeneratorSchema } from "./schema";

describe("configure-spellcheck generator", () => {
  let tree: Tree;
  const options: ConfigureSpellcheckGeneratorSchema = { project: "test" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Set up a proper project configuration using Nx's addProjectConfiguration
    addProjectConfiguration(tree, "test", {
      root: "apps/test",
      sourceRoot: "apps/test/src",
      projectType: "application",
      targets: {},
    });
  });

  it("should create root cspell config if it does not exists", async () => {
    await configureSpellcheckGenerator(tree, options);
    expect(tree.exists(".cspell.json")).toBeTruthy();
  });

  it("should create project-specific config and dictionary", async () => {
    await configureSpellcheckGenerator(tree, options);
    expect(tree.exists("apps/test/.cspell.json")).toBeTruthy();
    expect(tree.exists("apps/test/.cspell/test-dictionary.txt")).toBeTruthy();
  });

  it("should configure project config to extend root config", async () => {
    await configureSpellcheckGenerator(tree, options);
    const configContent = JSON.parse(
      tree.read("apps/test/.cspell.json", "utf-8")
    );
    expect(configContent.import).toContain("../.cspell.json");
  });

  it("should add spellcheck target to project configuration by default", async () => {
    await configureSpellcheckGenerator(tree, options);
    const projects = getProjects(tree);
    const project = projects.get("test");

    expect(project.targets.spellcheck).toBeDefined();
    expect(project.targets.spellcheck.executor).toBe(
      "@nx-community/nx-spellcheck:spellcheck"
    );
    expect(project.targets.spellcheck.options).toEqual({});
  });

  it("should not add spellcheck target when skipTarget is true", async () => {
    await configureSpellcheckGenerator(tree, { ...options, skipTarget: true });
    const projects = getProjects(tree);
    const project = projects.get("test");

    expect(project.targets.spellcheck).toBeUndefined();
  });
});
