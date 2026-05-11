import { SpellcheckExecutorSchema } from "./schema";
import executor from "./executor";
jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));
import { execSync } from "child_process";

const mockContext = {
  workspace: { projects: { testProject: { root: "libs/testProject" } } },
  projectName: "testProject",
} as any;

describe("Spellcheck Executor", () => {
  beforeEach(() => {
    (execSync as any) = jest.fn();
  });

  it("empty options", async () => {
    const options: SpellcheckExecutorSchema = {};

    const output = await executor(options, mockContext);
    expectCommandToHaveBeenCalled('cspell lint "libs/testProject/**" --color');
    expect(output.success).toBe(true);
  });

  it("config", async () => {
    const options: SpellcheckExecutorSchema = {
      cspellConfig: "cspell.config.js",
    };

    const output = await executor(options, mockContext);
    expectCommandToHaveBeenCalled(
      'cspell lint "libs/testProject/**" -c cspell.config.js --color',
    );
    expect(output.success).toBe(true);
  });

  it("disable color", async () => {
    const options: SpellcheckExecutorSchema = {
      disableColor: true,
    };

    const output = await executor(options, mockContext);
    expectCommandToHaveBeenCalled('cspell lint "libs/testProject/**"');
    expect(output.success).toBe(true);
  });

  it("config and disable color", async () => {
    const options: SpellcheckExecutorSchema = {
      cspellConfig: "cspell.config.js",
      disableColor: true,
    };

    const output = await executor(options, mockContext);
    expectCommandToHaveBeenCalled(
      'cspell lint "libs/testProject/**" -c cspell.config.js',
    );
    expect(output.success).toBe(true);
  });
});

function expectCommandToHaveBeenCalled(expectedCommandLineText: string) {
  expect(execSync).toHaveBeenCalledWith(expectedCommandLineText, {
    stdio: "inherit",
  });
}
