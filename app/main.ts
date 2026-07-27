import { createInterface } from "readline";
import fs from "fs";
import path from "path";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const builtinCommands: Array<string> = ["echo", "exit","type"];

function findCommandInPath(command: string): string | null {
  const pathEnv = process.env.PATH?.split(path.delimiter);
  for (const p of pathEnv) {
    const filePath = path.join(p, command);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch (err) {
    return false;
  }
}
// TODO: Uncomment the code below to pass the first stage
 rl.prompt();

 rl.on("line", (command) => {
    if (command === "exit") {
        rl.close();
        return;
    }
    else if  (command.startsWith("echo ")) {
        let message = command.slice(5);
        console.log(message);
    }
    else if (command.startsWith("type ")) {

        let message = command.slice(5);
        if (builtinCommands.includes(message)) {
            console.log(`${message} is a shell builtin`);
            rl.close();
            return;
        }
        else {
            const filePath = findCommandInPath(message);
            if (filePath) {
                if (isExecutable(filePath)) {
                    console.log(`${message} is ${filePath}`);
                }
            }
            else {
                console.log(`${message} not found`);
            }
        }
    }
    else {
        console.log(`${command}: command not found`);
    }
    rl.prompt();
 });
