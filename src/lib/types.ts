export type RecordingMode = "always" | "on-failure" | "off";
export type SnapshotMode = "always" | "per-step" | "start-end" | "off";

export interface RecordingPolicy {
  video: RecordingMode;
  har: RecordingMode;
  console: RecordingMode;
  trace: RecordingMode;
  snapshot: SnapshotMode;
}

export interface User {
  id: string;
  role?: string;
  email?: string;
  password_env?: string;
  auth_vault?: string;
  state_file?: string;
  notes?: string;
}

export interface Environment {
  id: string;
  baseUrl: string;
  provider?: string | null;
  config?: string;
  allowedDomains?: string[];
  headers?: Record<string, string>;
  requires_confirm?: boolean;
  recording?: Partial<RecordingPolicy>;
}

export interface ViewportSpec {
  w: number;
  h: number;
  scale?: number;
}

export type ScenarioStep =
  | { open: string }
  | { goto: string }
  | { back: true }
  | { forward: true }
  | { reload: true }
  | { wait: WaitSpec }
  | { sleep: number }
  | { click: string }
  | { fill: { selector: string; value: string } }
  | { type: { selector: string; value: string } }
  | { press: string }
  | { select: { selector: string; value: string } }
  | { check: string }
  | { uncheck: string }
  | { hover: string }
  | { focus: string }
  | { scrollintoview: string }
  | { upload: { selector: string; files: string[] } }
  | { find: FindStep }
  | { expect: ExpectStep }
  | { screenshot: string | { path?: string; full?: boolean; annotate?: boolean } }
  | { snapshot: true | { interactive?: boolean; scope?: string } }
  | { eval: string }
  | { set_headers: Record<string, string> }
  | { set_viewport: ViewportSpec }
  | { set_geo: { lat: number; lng: number } }
  | { cookies_clear: true }
  | { storage_clear: "local" | "session" | "all" };

export interface WaitSpec {
  load?: "load" | "domcontentloaded" | "networkidle";
  selector?: string;
  url?: string;
  text?: string;
  state?: "visible" | "hidden" | "attached" | "detached";
  timeout?: number;
  fn?: string;
}

export interface FindStep {
  role?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  alt?: string;
  title?: string;
  testid?: string;
  action: "click" | "fill" | "type" | "hover" | "focus" | "check" | "uncheck" | "press";
  value?: string;
  name?: string;
  exact?: boolean;
  nth?: number;
}

export interface ExpectStep {
  visible?: string;
  not_visible?: string;
  enabled?: string;
  checked?: string;
  url?: string;
  url_equals?: string;
  url_contains?: string;
  title?: string;
  title_equals?: string;
  title_contains?: string;
  text?: { selector: string; equals?: string; contains?: string; matches?: string };
  count?: { selector: string; equals?: number; gte?: number; lte?: number };
  value?: { selector: string; equals?: string };
  attr?: { selector: string; name: string; equals?: string; contains?: string };
}

export interface SetupStep {
  login?: boolean;
  open?: string;
  cookies_clear?: boolean;
  storage_clear?: "local" | "session" | "all";
  set_headers?: Record<string, string>;
}

export interface Scenario {
  name: string;
  description?: string;
  tags?: string[];
  requires?: {
    env?: string | "any" | string[];
    user_role?: string;
    user_id?: string;
    user?: string;
  };
  viewport?: ViewportSpec;
  setup?: SetupStep[];
  steps: ScenarioStep[];
  teardown?: SetupStep[];
  recording?: Partial<RecordingPolicy>;
  filePath?: string;
}

export interface RunsConfig {
  retention?: {
    keep_last?: number;
    keep_days?: number;
  };
  sinks?: SinkConfig[];
}

export type SinkConfig =
  | { type: "fs"; path: string; mode?: "copy" | "symlink"; notify_on?: SinkNotifyTrigger[] }
  | {
      type: "s3";
      bucket: string;
      prefix?: string;
      region?: string;
      credentials_env?: string;
      notify_on?: SinkNotifyTrigger[];
    }
  | { type: "slack"; channel: string; notify_on?: SinkNotifyTrigger[] }
  | { type: "linear"; team: string; create_issue_on?: SinkNotifyTrigger[]; labels?: string[] };

export type SinkNotifyTrigger = "failure" | "success" | "always";

export interface QaProject {
  root: string;
  users: User[];
  envs: Environment[];
  envDefault?: string;
  runsConfig?: RunsConfig;
}

export type StepStatus = "pass" | "fail" | "skip";

export interface StepResult {
  index: number;
  description: string;
  kind: string;
  status: StepStatus;
  started_at: string;
  duration_ms: number;
  error?: string;
  artifacts?: {
    screenshot?: string;
    snapshot?: string;
  };
  command_log: CommandLogEntry[];
}

export interface CommandLogEntry {
  argv: string[];
  exit_code: number;
  stdout: string;
  stderr: string;
  json?: unknown;
  duration_ms: number;
}

export interface RunResult {
  run_id: string;
  scenario: string;
  scenario_path?: string;
  env: string;
  user: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  status: StepStatus;
  fail_step?: number;
  fail_message?: string;
  steps: StepResult[];
  artifacts: {
    dir: string;
    video?: string;
    har?: string;
    console?: string;
    trace?: string;
    report?: string;
    result?: string;
  };
}
