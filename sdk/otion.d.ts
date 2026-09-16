/** Otion isolated extension SDK 1. Add a triple-slash reference; no runtime dependency. */
type OtionView =
  | { type: "text" | "heading"; text: string }
  | { type: "row" | "stack"; children: OtionView[] }
  | { type: "button"; text: string; action: string; value?: string }
  | { type: "input"; name: string; label: string; value: string; multiline?: boolean }
  | { type: "progress"; label: string; value: number; max: number };
interface OtionDocument { path: string; text: string; revision: string }
interface OtionAPI {
  document: { read(): Promise<OtionDocument>; write(text: string, expectedRevision: string): Promise<OtionDocument> };
  storage: { get(key: string): Promise<any>; set(key: string, value: unknown): Promise<void> };
  clipboard: { writeText(text: string): Promise<void> };
}
interface OtionInvocation { kind: "command" | "widget" | "block"; id: string; values?: Record<string, string>; event?: { action: string; value?: string; values: Record<string, string> } }
interface OtionResult { view?: OtionView; message?: string; patch?: Record<string, string> }
type OtionHandler = (api: OtionAPI, invocation: OtionInvocation) => OtionResult | Promise<OtionResult>;
declare const otion: { register(definition: { commands?: Record<string, OtionHandler>; widgets?: Record<string, OtionHandler>; blocks?: Record<string, OtionHandler> }): void };
