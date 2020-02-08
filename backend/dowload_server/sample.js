const { spawn } = require("child_process");

const ls = spawn("wget",["https://stackabuse.com/executing-shell-commands-with-node-js/","-P", "downloads"]);

ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
});