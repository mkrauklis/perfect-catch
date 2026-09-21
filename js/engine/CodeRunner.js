import { FightEndSignal } from "./Simulation.js";

const MAX_LOOP_ITERATIONS = 20000;

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) walk(n, visit);
    return;
  }
  if (typeof node.type === "string") visit(node);
  for (const key in node) {
    if (key === "type" || key === "start" || key === "end" || key === "loc" || key === "range") continue;
    const val = node[key];
    if (val && typeof val === "object") walk(val, visit);
  }
}

export function analyzeConcepts(ast) {
  const found = { variables: false, conditionals: false, loops: false, functions: false, calls: false };
  walk(ast, (node) => {
    if (node.type === "VariableDeclaration") found.variables = true;
    if (node.type === "IfStatement" || node.type === "ConditionalExpression") found.conditionals = true;
    if (node.type === "WhileStatement" || node.type === "ForStatement" || node.type === "DoWhileStatement") found.loops = true;
    if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") found.functions = true;
    if (node.type === "CallExpression") found.calls = true;
  });
  return found;
}

function instrumentLoops(code, ast) {
  const inserts = [];
  walk(ast, (node) => {
    if (node.type === "WhileStatement" || node.type === "ForStatement" || node.type === "DoWhileStatement") {
      const body = node.body;
      if (body.type === "BlockStatement") {
        inserts.push({ pos: body.start + 1, text: "__lg();" });
      } else {
        inserts.push({ pos: body.start, text: "{__lg();" });
        inserts.push({ pos: body.end, text: "}" });
      }
    }
  });
  inserts.sort((a, b) => b.pos - a.pos);
  let out = code;
  for (const ins of inserts) {
    out = out.slice(0, ins.pos) + ins.text + out.slice(ins.pos);
  }
  return out;
}

// Executes untrusted user code against a fishing-simulation API.
// Loops are instrumented with an iteration guard so a runaway while/for
// can't hang the tab; it throws a friendly, catchable error instead.
export function runCode(code, api) {
  let ast;
  try {
    ast = window.acorn.parse(code, { ecmaVersion: 2020 });
  } catch (e) {
    return { ok: false, error: `Syntax error: ${e.message}`, concepts: null, endedBy: "syntax" };
  }

  const concepts = analyzeConcepts(ast);
  const instrumented = instrumentLoops(code, ast);

  let iterCount = 0;
  const guard = () => {
    iterCount++;
    if (iterCount > MAX_LOOP_ITERATIONS) {
      throw new Error("Your loop ran too many times without finishing. Check your loop's stopping condition (e.g. while (!isLanded() && !isDone())).");
    }
  };

  const fullApi = { ...api, __lg: guard };
  const argNames = Object.keys(fullApi);
  const argVals = Object.values(fullApi);

  try {
    const fn = new Function(...argNames, `"use strict";\n${instrumented}\n`);
    fn(...argVals);
    return { ok: true, concepts, endedBy: "complete" };
  } catch (e) {
    if (e instanceof FightEndSignal) {
      return { ok: true, concepts, endedBy: e.reason };
    }
    return { ok: false, error: e.message, concepts, endedBy: "error" };
  }
}
