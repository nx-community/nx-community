import {
  Tree,
  formatFiles,
  getProjects,
  joinPathFragments,
  updateProjectConfiguration,
  ProjectConfiguration,
} from "@nx/devkit";
import { ConfigureSpellcheckGeneratorSchema } from "./schema";

function ensureRootCSpellConfig(tree: Tree) {
  const rootConfigPath = ".cspell.json";
  if (!tree.exists(rootConfigPath)) {
    const rootConfig = {
      version: "0.2",
      language: "en",
      allowCompoundWords: true,
      dictionaries: [],
      dictionaryDefinitions: [],
      ignorePaths: [
        "node_modules",
        "dist",
        "coverage",
        ".git",
        "pnpm-lock.yaml",
      ],
    };
    tree.write(rootConfigPath, JSON.stringify(rootConfig, null, 2));
  }
}

function createProjectConfig(
  tree: Tree,
  projectName: string,
  projectRoot: string
) {
  const projectConfigPath = joinPathFragments(projectRoot, ".cspell.json");
  const dictionaryPath = joinPathFragments(projectRoot, ".cspell");
  const dictionaryFile = joinPathFragments(
    dictionaryPath,
    `${projectName}-dictionary.txt`
  );

  // Create .cspell directory
  tree.write(dictionaryFile, `# ${projectName} dictionary\n`);

  // Create project-specific cspell config
  const projectConfig = {
    version: "0.2",
    import: ["../.cspell.json"],
    dictionaryDefinitions: [
      {
        name: `${projectName}-dictionary`,
        path: `./.cspell/${projectName}-dictionary.txt`,
        addWords: true,
      },
    ],
    dictionaries: [`${projectName}-dictionary`],
  };

  tree.write(projectConfigPath, JSON.stringify(projectConfig, null, 2));
}

export async function configureSpellcheckGenerator(
  tree: Tree,
  options: ConfigureSpellcheckGeneratorSchema
) {
  const projects = getProjects(tree);
  const project = projects.get(options.project);

  if (!project) {
    throw new Error(`Project ${options.project} not found`);
  }

  // Ensure root config exists
  ensureRootCSpellConfig(tree);

  // Create project-specific config and dictionary
  createProjectConfig(tree, options.project, project.root);

  // Add spellcheck target if it doesn't exist and skipTarget is not true
  if (!options.skipTarget && !project.targets?.["spellcheck"]) {
    const updatedProject: ProjectConfiguration = {
      ...project,
      targets: {
        ...project.targets,
        spellcheck: {
          executor: "@nx-community/nx-spellcheck:spellcheck",
          options: {},
        },
      },
    };
    updateProjectConfiguration(tree, options.project, updatedProject);
  }

  await formatFiles(tree);
}

export default configureSpellcheckGenerator;
