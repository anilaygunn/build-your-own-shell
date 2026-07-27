import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const builtinCommands: Array<string> = ["echo", "exit", "type"];

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function findCommandInPath(command: string): string | null {
  const pathEnv = process.env.PATH?.split(path.delimiter) ?? [];
  for (const p of pathEnv) {
    const filePath = path.join(p, command);
    if (fs.existsSync(filePath) && isExecutable(filePath)) {
      return filePath;
    }
  }
  return null;
}

// naive whitespace tokenizer — fine until the quoting stage is introduced
function parseArgs(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

rl.prompt();

rl.on("line", (command) => {
  if (command === "exit") {
    rl.close();
    return;
  } else if (command.startsWith("echo ")) {
    const message = command.slice(5);
    console.log(message);
  } else if (command.startsWith("type ")) {
    const message = command.slice(5);
    if (builtinCommands.includes(message)) {
      console.log(`${message} is a shell builtin`);
    } else {
      const filePath = findCommandInPath(message);
      if (filePath) {
        console.log(`${message} is ${filePath}`);
      } else {
        console.log(`${message} not found`);
      }
    }
  } else {
    const args = parseArgs(command);
    const programName = args[0];

    if (!programName) {
      rl.prompt();
      return;
    }

    const filePath = findCommandInPath(programName);
    if (filePath) {
      // argv0 should be the program name as typed, not the resolved full path
      spawnSync(filePath, args.slice(1), {
        stdio: "inherit",
        argv0: programName,
      });
    } else {
      console.log(`${command}: command not found`);
    }
  }
  rl.prompt();
});