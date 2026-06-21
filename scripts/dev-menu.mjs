#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";
import readline from "node:readline/promises";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const commands = [
  {
    label: "Dev server",
    command: "pnpm",
    args: ["dev"]
  },
  {
    label: "Build notebook data",
    command: "pnpm",
    args: ["build:data"]
  },
  {
    label: "Build",
    command: "pnpm",
    args: ["build"]
  },
  {
    label: "Preview build",
    command: "pnpm",
    args: ["preview"]
  },
  {
    label: "Typecheck",
    command: "pnpm",
    args: ["typecheck"]
  },
  {
    label: "Install dependencies",
    command: "pnpm",
    args: ["install"]
  },
  {
    label: "Bump moneyjs submodule",
    hint: "git submodule update --remote moneyjs + commit + pnpm build",
    run: bumpMoneyjsSubmodule
  }
];

function resolveCommand(command) {
  return command === "pnpm" ? pnpmCommand : command;
}

function formatCommand({ command, args }) {
  return [command, ...args].join(" ");
}

function describe(entry) {
  if (entry.run) {
    return entry.hint ?? "";
  }
  return formatCommand(entry);
}

// Run a command inheriting stdio; resolves with the exit code.
function runStep(command, args) {
  console.log(`\n$ ${[command, ...args].join(" ")}\n`);
  return new Promise((resolve) => {
    const child = spawn(resolveCommand(command), args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });
    child.on("exit", (code, signal) => {
      if (signal) {
        console.error(`Command stopped by signal ${signal}`);
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
    child.on("error", (error) => {
      console.error(`Failed to start command: ${error.message}`);
      resolve(1);
    });
  });
}

// Run a command and capture its trimmed stdout; resolves with { code, stdout }.
function captureStep(command, args) {
  return new Promise((resolve) => {
    const child = spawn(resolveCommand(command), args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["inherit", "pipe", "inherit"]
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("exit", (code) => resolve({ code: code ?? 1, stdout: stdout.trim() }));
    child.on("error", (error) => {
      console.error(`Failed to start command: ${error.message}`);
      resolve({ code: 1, stdout: "" });
    });
  });
}

async function bumpMoneyjsSubmodule() {
  // protocol.file.allow=always is required when the submodule tracks a local
  // path (Git blocks the file transport for submodules since CVE-2022-39253);
  // it is a harmless no-op for an https remote.
  let code = await runStep("git", [
    "-c",
    "protocol.file.allow=always",
    "submodule",
    "update",
    "--remote",
    "moneyjs"
  ]);
  if (code !== 0) {
    return code;
  }

  const { stdout: sha } = await captureStep("git", ["-C", "moneyjs", "rev-parse", "--short", "HEAD"]);

  code = await runStep("git", ["add", "moneyjs"]);
  if (code !== 0) {
    return code;
  }

  // Nothing staged means the submodule was already up to date.
  const { code: diffCode } = await captureStep("git", ["diff", "--cached", "--quiet", "--", "moneyjs"]);
  if (diffCode === 0) {
    console.log("\nmoneyjs is already up to date; nothing to commit.\n");
  } else {
    code = await runStep("git", ["commit", "-m", `Bump moneyjs to ${sha}`]);
    if (code !== 0) {
      return code;
    }
  }

  // prebuild regenerates app/src/data from the new submodule source.
  return runStep("pnpm", ["build"]);
}

function printMenu() {
  console.log("\nmoneyjs-docs command menu\n");
  commands.forEach((entry, index) => {
    const number = String(index + 1).padStart(2, " ");
    console.log(`${number}. ${entry.label.padEnd(24)} ${describe(entry)}`);
  });
  console.log("\nq. Quit\n");
}

async function main() {
  printMenu();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = (await rl.question("Choose a command: ")).trim().toLowerCase();
  rl.close();

  if (answer === "q" || answer === "quit" || answer === "exit") {
    return;
  }

  const selection = Number(answer);
  const entry = Number.isInteger(selection) ? commands[selection - 1] : undefined;

  if (!entry) {
    console.error(`Invalid selection: ${answer || "(blank)"}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nRunning: ${entry.label}`);

  if (entry.run) {
    process.exitCode = await entry.run();
    return;
  }

  process.exitCode = await runStep(entry.command, entry.args);
}

await main();
