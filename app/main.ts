import { createInterface } from "readline";
import {which} from "which";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const builtinCommands: Array<string> = ["echo", "exit","type"];

async function isFileExecutable(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile() && (stats.mode & 0o100) !== 0;
  } catch {
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
            const path = which.sync(message, { nothrow: true });
            if (path) {
                console.log(`${message} is ${path}`);
            } else {
                console.log(`${message} not found`);
            }
        }
    }
    else {
        console.log(`${command}: command not found`);
    }
    rl.prompt();
 });
