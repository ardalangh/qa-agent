import { ExpectStep, FindStep, Scenario, ScenarioStep, WaitSpec } from "./types";
import { substituteVars } from "./config";

export type StepKind =
  | "navigation"
  | "interaction"
  | "wait"
  | "assertion"
  | "capture"
  | "config";

export interface CompiledCommand {
  argv: string[];
  jsonOutput?: boolean;
  evaluate?: (json: unknown, stdout: string, exitCode: number) => AssertionOutcome | null;
}

export interface AssertionOutcome {
  pass: boolean;
  message?: string;
  observed?: unknown;
}

export interface CompiledStep {
  index: number;
  description: string;
  kind: StepKind;
  commands: CompiledCommand[];
}

export interface CompileContext {
  baseUrl: string;
  env: string;
  user: string;
}

export function compileScenario(scenario: Scenario, ctx: CompileContext): CompiledStep[] {
  const out: CompiledStep[] = [];
  scenario.steps.forEach((step, idx) => {
    const compiled = compileStep(step, idx, ctx);
    if (compiled) out.push(compiled);
  });
  return out;
}

function sub(s: string, ctx: CompileContext): string {
  return substituteVars(s, ctx);
}

function compileStep(step: ScenarioStep, index: number, ctx: CompileContext): CompiledStep | null {
  const s = step as Record<string, unknown>;
  if ("open" in s || "goto" in s) {
    const url = sub(String(s.open ?? s.goto), ctx);
    return {
      index,
      description: `open ${url}`,
      kind: "navigation",
      commands: [{ argv: ["open", url] }],
    };
  }
  if ("back" in s) return cmd(index, "back", "navigation", ["back"]);
  if ("forward" in s) return cmd(index, "forward", "navigation", ["forward"]);
  if ("reload" in s) return cmd(index, "reload", "navigation", ["reload"]);

  if ("wait" in s) return compileWait(index, s.wait as WaitSpec, ctx);
  if ("sleep" in s) {
    const ms = Number(s.sleep);
    return cmd(index, `sleep ${ms}ms`, "wait", ["wait", String(ms)]);
  }

  if ("click" in s) return cmd(index, `click ${s.click}`, "interaction", ["click", String(s.click)]);
  if ("fill" in s) {
    const f = s.fill as { selector: string; value: string };
    return cmd(index, `fill ${f.selector}`, "interaction", ["fill", f.selector, f.value]);
  }
  if ("type" in s) {
    const f = s.type as { selector: string; value: string };
    return cmd(index, `type ${f.selector}`, "interaction", ["type", f.selector, f.value]);
  }
  if ("press" in s) return cmd(index, `press ${s.press}`, "interaction", ["press", String(s.press)]);
  if ("select" in s) {
    const f = s.select as { selector: string; value: string };
    return cmd(index, `select ${f.selector}=${f.value}`, "interaction", [
      "select",
      f.selector,
      f.value,
    ]);
  }
  if ("check" in s) return cmd(index, `check ${s.check}`, "interaction", ["check", String(s.check)]);
  if ("uncheck" in s) return cmd(index, `uncheck ${s.uncheck}`, "interaction", ["uncheck", String(s.uncheck)]);
  if ("hover" in s) return cmd(index, `hover ${s.hover}`, "interaction", ["hover", String(s.hover)]);
  if ("focus" in s) return cmd(index, `focus ${s.focus}`, "interaction", ["focus", String(s.focus)]);
  if ("scrollintoview" in s) {
    return cmd(index, `scrollintoview ${s.scrollintoview}`, "interaction", [
      "scrollintoview",
      String(s.scrollintoview),
    ]);
  }
  if ("upload" in s) {
    const u = s.upload as { selector: string; files: string[] };
    return cmd(index, `upload ${u.selector}`, "interaction", ["upload", u.selector, ...u.files]);
  }

  if ("find" in s) return compileFind(index, s.find as FindStep);
  if ("expect" in s) return compileExpect(index, s.expect as ExpectStep, ctx);

  if ("screenshot" in s) {
    const v = s.screenshot;
    const argv: string[] = ["screenshot"];
    let label = "screenshot";
    if (typeof v === "string") {
      argv.push(v);
      label = `screenshot ${v}`;
    } else if (typeof v === "object" && v !== null) {
      const o = v as { path?: string; full?: boolean; annotate?: boolean };
      if (o.full) argv.push("--full");
      if (o.annotate) argv.push("--annotate");
      if (o.path) {
        argv.push(o.path);
        label = `screenshot ${o.path}`;
      }
    }
    return cmd(index, label, "capture", argv);
  }
  if ("snapshot" in s) {
    const v = s.snapshot;
    const argv: string[] = ["snapshot"];
    if (typeof v === "object" && v !== null) {
      const o = v as { interactive?: boolean; scope?: string };
      if (o.interactive !== false) argv.push("-i");
      if (o.scope) argv.push("-s", o.scope);
    } else {
      argv.push("-i");
    }
    return { index, description: "snapshot", kind: "capture", commands: [{ argv, jsonOutput: true }] };
  }

  if ("eval" in s) return cmd(index, `eval`, "interaction", ["eval", String(s.eval)]);
  if ("set_headers" in s) {
    return cmd(index, "set headers", "config", ["set", "headers", JSON.stringify(s.set_headers)]);
  }
  if ("set_viewport" in s) {
    const v = s.set_viewport as { w: number; h: number; scale?: number };
    const argv = ["set", "viewport", String(v.w), String(v.h)];
    if (v.scale) argv.push(String(v.scale));
    return cmd(index, `set viewport ${v.w}x${v.h}`, "config", argv);
  }
  if ("set_geo" in s) {
    const g = s.set_geo as { lat: number; lng: number };
    return cmd(index, `set geo ${g.lat},${g.lng}`, "config", [
      "set",
      "geo",
      String(g.lat),
      String(g.lng),
    ]);
  }
  if ("cookies_clear" in s) return cmd(index, "cookies clear", "config", ["cookies", "clear"]);
  if ("storage_clear" in s) {
    const which = s.storage_clear as string;
    if (which === "all") {
      return {
        index,
        description: "storage clear (local+session)",
        kind: "config",
        commands: [
          { argv: ["storage", "local", "clear"] },
          { argv: ["storage", "session", "clear"] },
        ],
      };
    }
    return cmd(index, `storage ${which} clear`, "config", ["storage", which, "clear"]);
  }

  return {
    index,
    description: `unknown step: ${JSON.stringify(step).slice(0, 80)}`,
    kind: "config",
    commands: [],
  };
}

function cmd(
  index: number,
  description: string,
  kind: StepKind,
  argv: string[],
): CompiledStep {
  return { index, description, kind, commands: [{ argv }] };
}

function compileWait(index: number, w: WaitSpec, ctx: CompileContext): CompiledStep {
  const argv: string[] = ["wait"];
  let label = "wait";
  if (w.load) {
    argv.push("--load", w.load);
    label = `wait load=${w.load}`;
  } else if (w.url) {
    argv.push("--url", sub(w.url, ctx));
    label = `wait url=${w.url}`;
  } else if (w.text) {
    argv.push("--text", w.text);
    label = `wait text="${w.text}"`;
  } else if (w.fn) {
    argv.push("--fn", w.fn);
    label = `wait fn`;
  } else if (w.selector) {
    argv.push(w.selector);
    if (w.state) argv.push("--state", w.state);
    label = `wait ${w.selector}${w.state ? ` state=${w.state}` : ""}`;
  }
  if (w.timeout) argv.push("--timeout", String(w.timeout));
  return { index, description: label, kind: "wait", commands: [{ argv }] };
}

function compileFind(index: number, f: FindStep): CompiledStep {
  const argv: string[] = ["find"];
  let by: string | undefined;
  let val: string | undefined;
  const fRecord = f as unknown as Record<string, unknown>;
  for (const key of ["role", "text", "label", "placeholder", "alt", "title", "testid"] as const) {
    if (fRecord[key]) {
      by = key;
      val = String(fRecord[key]);
      break;
    }
  }
  if (!by || !val) {
    return cmd(index, "find (invalid)", "interaction", []);
  }
  argv.push(by, val, f.action);
  if (f.value !== undefined) argv.push(f.value);
  if (f.name) argv.push("--name", f.name);
  if (f.exact) argv.push("--exact");
  const label = `find ${by}="${val}" ${f.action}${f.value ? ` "${f.value}"` : ""}`;
  return { index, description: label, kind: "interaction", commands: [{ argv }] };
}

function compileExpect(index: number, e: ExpectStep, ctx: CompileContext): CompiledStep {
  if (e.visible !== undefined) {
    const sel = e.visible;
    return {
      index,
      description: `expect visible ${sel}`,
      kind: "assertion",
      commands: [
        {
          argv: ["is", "visible", sel],
          jsonOutput: true,
          evaluate: (json, _stdout, exit) => assertIsTrue(json, exit, `${sel} not visible`),
        },
      ],
    };
  }
  if (e.not_visible !== undefined) {
    const sel = e.not_visible;
    return {
      index,
      description: `expect not visible ${sel}`,
      kind: "assertion",
      commands: [
        {
          argv: ["is", "visible", sel],
          jsonOutput: true,
          evaluate: (json, _stdout, exit) => assertIsFalse(json, exit, `${sel} unexpectedly visible`),
        },
      ],
    };
  }
  if (e.enabled !== undefined) {
    const sel = e.enabled;
    return {
      index,
      description: `expect enabled ${sel}`,
      kind: "assertion",
      commands: [
        {
          argv: ["is", "enabled", sel],
          jsonOutput: true,
          evaluate: (json, _stdout, exit) => assertIsTrue(json, exit, `${sel} not enabled`),
        },
      ],
    };
  }
  if (e.checked !== undefined) {
    const sel = e.checked;
    return {
      index,
      description: `expect checked ${sel}`,
      kind: "assertion",
      commands: [
        {
          argv: ["is", "checked", sel],
          jsonOutput: true,
          evaluate: (json, _stdout, exit) => assertIsTrue(json, exit, `${sel} not checked`),
        },
      ],
    };
  }
  if (e.url !== undefined) {
    const pattern = sub(e.url, ctx);
    return {
      index,
      description: `expect url matches ${pattern}`,
      kind: "assertion",
      commands: [{ argv: ["wait", "--url", pattern] }],
    };
  }
  if (e.url_equals !== undefined || e.url_contains !== undefined) {
    const expected = sub(e.url_equals ?? e.url_contains!, ctx);
    const op = e.url_equals !== undefined ? "equals" : "contains";
    return {
      index,
      description: `expect url ${op} ${expected}`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "url"],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const got = extractData(json, stdout);
            const ok = op === "equals" ? got === expected : got.includes(expected);
            return {
              pass: ok,
              message: ok ? undefined : `url ${op} '${expected}', got '${got}'`,
              observed: got,
            };
          },
        },
      ],
    };
  }
  if (e.title !== undefined || e.title_equals !== undefined || e.title_contains !== undefined) {
    const expected = String(e.title ?? e.title_equals ?? e.title_contains);
    const op = e.title_contains !== undefined ? "contains" : "equals";
    return {
      index,
      description: `expect title ${op} ${expected}`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "title"],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const got = extractData(json, stdout);
            const ok = op === "equals" ? got === expected : got.includes(expected);
            return {
              pass: ok,
              message: ok ? undefined : `title ${op} '${expected}', got '${got}'`,
              observed: got,
            };
          },
        },
      ],
    };
  }
  if (e.text !== undefined) {
    const t = e.text;
    return {
      index,
      description: `expect text ${t.selector}`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "text", t.selector],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const got = extractData(json, stdout);
            if (t.equals !== undefined) {
              const ok = got === t.equals;
              return {
                pass: ok,
                message: ok ? undefined : `text equals '${t.equals}', got '${got}'`,
                observed: got,
              };
            }
            if (t.contains !== undefined) {
              const ok = got.includes(t.contains);
              return {
                pass: ok,
                message: ok ? undefined : `text contains '${t.contains}', got '${got}'`,
                observed: got,
              };
            }
            if (t.matches !== undefined) {
              const re = new RegExp(t.matches);
              const ok = re.test(got);
              return {
                pass: ok,
                message: ok ? undefined : `text matches ${t.matches}, got '${got}'`,
                observed: got,
              };
            }
            return { pass: true };
          },
        },
      ],
    };
  }
  if (e.count !== undefined) {
    const c = e.count;
    return {
      index,
      description: `expect count ${c.selector}`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "count", c.selector],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const raw = extractData(json, stdout);
            const n = Number(raw);
            if (c.equals !== undefined) {
              const ok = n === c.equals;
              return { pass: ok, message: ok ? undefined : `count equals ${c.equals}, got ${n}`, observed: n };
            }
            if (c.gte !== undefined) {
              const ok = n >= c.gte;
              return { pass: ok, message: ok ? undefined : `count >= ${c.gte}, got ${n}`, observed: n };
            }
            if (c.lte !== undefined) {
              const ok = n <= c.lte;
              return { pass: ok, message: ok ? undefined : `count <= ${c.lte}, got ${n}`, observed: n };
            }
            return { pass: true };
          },
        },
      ],
    };
  }
  if (e.value !== undefined) {
    const v = e.value;
    return {
      index,
      description: `expect value ${v.selector}`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "value", v.selector],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const got = extractData(json, stdout);
            const ok = got === v.equals;
            return { pass: ok, message: ok ? undefined : `value equals '${v.equals}', got '${got}'`, observed: got };
          },
        },
      ],
    };
  }
  if (e.attr !== undefined) {
    const a = e.attr;
    return {
      index,
      description: `expect attr ${a.selector}[${a.name}]`,
      kind: "assertion",
      commands: [
        {
          argv: ["get", "attr", a.selector, a.name],
          jsonOutput: true,
          evaluate: (json, stdout) => {
            const got = extractData(json, stdout);
            if (a.equals !== undefined) {
              const ok = got === a.equals;
              return { pass: ok, message: ok ? undefined : `attr ${a.name} equals '${a.equals}', got '${got}'`, observed: got };
            }
            if (a.contains !== undefined) {
              const ok = got.includes(a.contains);
              return { pass: ok, message: ok ? undefined : `attr ${a.name} contains '${a.contains}', got '${got}'`, observed: got };
            }
            return { pass: true };
          },
        },
      ],
    };
  }
  return {
    index,
    description: `expect (no-op): ${JSON.stringify(e)}`,
    kind: "assertion",
    commands: [],
  };
}

function assertIsTrue(json: unknown, exitCode: number, failMsg: string): AssertionOutcome {
  const data = pluckData(json);
  if (typeof data === "boolean") return { pass: data, message: data ? undefined : failMsg, observed: data };
  if (typeof data === "string") {
    const truthy = /^(true|yes|1)$/i.test(data.trim());
    return { pass: truthy, message: truthy ? undefined : failMsg, observed: data };
  }
  return { pass: exitCode === 0, message: exitCode === 0 ? undefined : failMsg };
}

function assertIsFalse(json: unknown, exitCode: number, failMsg: string): AssertionOutcome {
  const r = assertIsTrue(json, exitCode, "");
  return { pass: !r.pass, message: r.pass ? failMsg : undefined, observed: r.observed };
}

function pluckData(json: unknown): unknown {
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: unknown }).data;
  }
  return json;
}

function extractData(json: unknown, stdout: string): string {
  const data = pluckData(json);
  if (data === undefined || data === null) return stdout.trim();
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  return JSON.stringify(data);
}
