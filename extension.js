/// <reference path="sdk/otion.d.ts" />
/* Approved readable source. The host never imports modules or runs install scripts. */
otion.register({
  commands: {
    "page-statistics": async (api) => {
      const page = await api.document.read();
      const words = page.text.trim().split(/\s+/).filter(Boolean).length;
      const tasks = [...page.text.matchAll(/^\s*[-*] \[([ xX])\]/gm)];
      const complete = tasks.filter((match) => match[1].toLowerCase() === "x").length;
      return { view: { type: "stack", children: [
        { type: "heading", text: "Page statistics" },
        { type: "text", text: `${words} words · ${page.text.length} characters · about ${Math.max(1, Math.ceil(words / 200))} minutes to read` },
        { type: "text", text: `${complete} of ${tasks.length} Markdown tasks complete` },
      ] } };
    },
  },
  widgets: {
    "focus-counter": async (api, invocation) => {
      const day = new Date().toISOString().slice(0, 10);
      const previous = await api.storage.get("focus");
      let count = previous && previous.day === day && Number.isInteger(previous.count) ? previous.count : 0;
      if (invocation.event?.action === "increment") count = Math.min(100, count + 1);
      if (invocation.event?.action === "reset") count = 0;
      if (invocation.event) await api.storage.set("focus", { day, count });
      return { view: { type: "stack", children: [
        { type: "heading", text: "Today's focus sessions" },
        { type: "text", text: `${count} completed · ${day} (UTC)` },
        { type: "row", children: [{ type: "button", text: "Complete a session", action: "increment" }, { type: "button", text: "Reset", action: "reset" }] },
      ] } };
    },
  },
  blocks: {
    decisionCard: (_api, invocation) => {
      const status = invocation.event?.action === "approve" ? "approved" : invocation.values?.status || "draft";
      return {
        ...(invocation.event?.action === "approve" ? { patch: { status } } : {}),
        view: { type: "stack", children: [
          { type: "heading", text: invocation.values?.title || "Decision" },
          { type: "text", text: `${status.toUpperCase()}: ${invocation.values?.decision || "No decision recorded"}` },
          { type: "button", text: "Mark approved", action: "approve" },
        ] },
      };
    },
    projectBrief: (_api, invocation) => ({ view: { type: "stack", children: [
      { type: "heading", text: invocation.values?.title || "Project brief" },
      { type: "text", text: invocation.values?.goal || "Set a goal in the card fields above." },
      { type: "text", text: `Owner: ${invocation.values?.owner || "Unassigned"}` },
    ] } }),
  },
});
