import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import {execSync} from "child_process";

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
    // exists but not executable (or dir doesn't exist) -> keep searching
  }
  return null;
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
  } else if(isExecutable(command)) {
    execSync(command, { stdio: "inherit" });
  } else {
    console.log(`${command}: command not found`);
  }
  rl.prompt();
});