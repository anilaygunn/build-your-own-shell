import { createInterface } from "node:readline";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

type CommandHandler = (args: string[]) => void;

const builtins : Record<string, CommandHandler> = {
  echo: (args: string[]) => {
    console.log(args.join(" "));
  },
  exit: () => {
    rl.close();
    return;
  },
  type: (args: string[]) => {
    const command = args[0];
    if (!command) {
      console.log("type: missing argument");
      return false;
    }

    if (command in builtins) {
      console.log(`${command} is a shell builtin`);
      return false;
    }

    const filePath = findCommandInPath(command);
    if (filePath) {
      console.log(`${command} is ${filePath}`);
    } else {
      console.log(`${command} not found`);
    }

    return false;
  },
  pwd: () => {
    console.log(process.cwd());
    return false;
  },
};
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

function runExternalCommand(args: string[]) : void {
  const programName = args[0];
  if (!programName) {
    return;
  }

  const filePath = findCommandInPath(programName);
  if (filePath) {
    spawnSync(filePath, args.slice(1), { stdio: "inherit", argv0: programName});
  }else{
    console.log(`${programName}: command not found`);
  }
}

function handleCommand(input: string): void {
  const args = parseArgs(input);

  if (args.length === 0) {
    rl.prompt();
    return;
  }
  const command = args[0];

  if (command in builtins) {
    const shouldExit = builtins[command](args.slice(1));
    if (shouldExit) {
      return;
    }
  } else {
    runExternalCommand(args);
  }
  rl.prompt();
}

rl.prompt();
rl.on("line", handleCommand);

