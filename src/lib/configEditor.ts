import fs from "node:fs";
import YAML from "yaml";

export interface ConfigEdit {
  file: string;
  type: "user" | "env";
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export async function editConfig(edits: ConfigEdit[]): Promise<void> {
  // Group edits by file
  const byFile = new Map<string, ConfigEdit[]>();
  for (const edit of edits) {
    const existing = byFile.get(edit.file) ?? [];
    existing.push(edit);
    byFile.set(edit.file, existing);
  }

  for (const [file, fileEdits] of byFile) {
    const content = fs.readFileSync(file, "utf8");
    const doc = YAML.parseDocument(content);

    for (const edit of fileEdits) {
      if (edit.type === "user") {
        applyUserEdit(doc, edit);
      } else if (edit.type === "env") {
        applyEnvEdit(doc, edit);
      }
    }

    fs.writeFileSync(file, doc.toString(), "utf8");
  }
}

function applyUserEdit(doc: YAML.Document, edit: ConfigEdit): void {
  const users = doc.get("users") as YAML.YAMLSeq | undefined;
  if (!users || !YAML.isSeq(users)) return;

  for (let i = 0; i < users.items.length; i++) {
    const user = users.get(i) as YAML.YAMLMap | undefined;
    if (!user || !YAML.isMap(user)) continue;

    const userId = user.get("id");
    if (userId === edit.id) {
      user.set(edit.field, edit.newValue);
      break;
    }
  }
}

function applyEnvEdit(doc: YAML.Document, edit: ConfigEdit): void {
  const envs = doc.get("environments") as YAML.YAMLMap | undefined;
  if (!envs || !YAML.isMap(envs)) return;

  const env = envs.get(edit.id) as YAML.YAMLMap | undefined;
  if (!env || !YAML.isMap(env)) return;

  env.set(edit.field, edit.newValue);
}
