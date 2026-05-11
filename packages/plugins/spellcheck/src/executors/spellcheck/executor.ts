import { SpellcheckExecutorSchema } from "./schema";
import { execSync } from "child_process";
import { getCwdForCspell } from "../utils";
import { ExecutorContext } from "@nx/devkit";

export default async function runExecutor(
  options: SpellcheckExecutorSchema,
  context: ExecutorContext & { projectName: string },
) {
  const cwd = getCwdForCspell(context);
  const args = argsFromOptions(options);

  const command = ["cspell", "lint", `"${cwd}/**"`].concat(args).join(" ");
  execSync(command, { stdio: "inherit" });
  return { success: true };
}

function argsFromOptions(options: SpellcheckExecutorSchema): string[] {
  const args = [];
  if (options.cspellConfig) {
    args.push("-c", options.cspellConfig);
  }
  if (!options.disableColor) {
    args.push("--color");
  }
  return args;
}
