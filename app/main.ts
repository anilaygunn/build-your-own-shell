import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const builtinCommands: Array<string> = ["echo", "exit","type"];

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
        }
        else {
            console.log(`${message}: not found`);
        }
    }
    else {
        console.log(`${command}: command not found`);
    }
    rl.prompt();
 });
