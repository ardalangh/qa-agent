export function generateRunId(scenario: string, env: string, user: string, now: Date = new Date()): string {
  const iso = now.toISOString().replace(/\.\d+Z$/, "Z").replace(/:/g, "-");
  const slug = (s: string) => s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${iso}__${slug(scenario)}__${slug(env)}__${slug(user)}`;
}

export function parseRunId(id: string): { iso: string; scenario: string; env: string; user: string } | null {
  const parts = id.split("__");
  if (parts.length !== 4) return null;
  return { iso: parts[0], scenario: parts[1], env: parts[2], user: parts[3] };
}
