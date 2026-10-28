import { spawn } from "node:child_process";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  process.stderr.write("Usage: serena-stdio-guard.mjs <command> [args...]\n");
  process.exit(2);
}

const child = spawn(command, args, {
  detached: process.platform !== "win32",
  stdio: ["pipe", "pipe", "inherit"],
  windowsHide: true,
});

let shutdownTimer;
let startupFailed = false;

function terminateChildTree() {
  if (child.exitCode !== null || child.signalCode !== null) return;

  if (process.platform === "win32") {
    const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("error", () => child.kill("SIGKILL"));
    return;
  }

  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
}

child.on("error", (error) => {
  startupFailed = true;
  process.stderr.write(`Could not start Serena: ${error.message}\n`);
});

child.stdout.pipe(process.stdout);
process.stdin.pipe(child.stdin);
child.stdin.on("error", (error) => {
  if (error.code !== "EPIPE") terminateChildTree();
});

process.stdin.on("end", () => {
  shutdownTimer = setTimeout(terminateChildTree, 3000);
  shutdownTimer.unref();
});

process.stdout.on("error", (error) => {
  if (error.code === "EPIPE") terminateChildTree();
});

child.on("close", (code, signal) => {
  clearTimeout(shutdownTimer);
  process.stdin.destroy();
  process.exitCode = startupFailed ? 1 : (code ?? (signal ? 1 : 0));
});

process.on("SIGINT", terminateChildTree);
process.on("SIGTERM", terminateChildTree);
