<script lang="ts">
  import { createDetector } from "profanity-kit/core";
  import { english } from "profanity-kit/languages/en";
  import { indonesian } from "profanity-kit/languages/id";

  type Language = "en" | "id";
  const packs = { en: english, id: indonesian } as const;

  let language: Language = "en";
  let input = "This is shit, but classic stays clean.";
  let blockList = "";
  let allowList = "";
  let replacement = "*";
  let copied = false;

  $: detector = createDetector({
    languages: [packs[language]],
    blockList: blockList
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean),
    allowList: allowList
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean),
    replacement,
  });
  $: matches = detector.findAll(input);
  $: filtered = detector.filter(input);
  $: example = `import { createDetector } from "profanity-kit";\n\nconst detector = createDetector();\ndetector.filter(${JSON.stringify(input)});`;

  async function copyExample() {
    await navigator.clipboard.writeText(example);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="not-prose border-border bg-card rounded-xl border p-5 shadow-sm">
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="grid gap-1 text-sm font-medium">
      Language
      <select
        bind:value={language}
        class="border-border bg-background rounded-md border px-3 py-2 font-normal"
      >
        <option value="en">English</option>
        <option value="id">Indonesian</option>
      </select>
    </label>
    <label class="grid gap-1 text-sm font-medium">
      Replacement
      <input
        bind:value={replacement}
        maxlength="2"
        class="border-border bg-background rounded-md border px-3 py-2 font-normal"
      />
    </label>
  </div>

  <label class="mt-4 grid gap-1 text-sm font-medium">
    Text to inspect
    <textarea
      bind:value={input}
      rows="4"
      class="border-border bg-background rounded-md border px-3 py-2 font-normal"
    />
  </label>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <label class="grid gap-1 text-sm font-medium">
      Block list <span class="text-muted-foreground font-normal"
        >comma-separated</span
      >
      <input
        bind:value={blockList}
        class="border-border bg-background rounded-md border px-3 py-2 font-normal"
      />
    </label>
    <label class="grid gap-1 text-sm font-medium">
      Allow list <span class="text-muted-foreground font-normal"
        >comma-separated</span
      >
      <input
        bind:value={allowList}
        class="border-border bg-background rounded-md border px-3 py-2 font-normal"
      />
    </label>
  </div>

  <dl class="mt-5 grid gap-3 sm:grid-cols-3">
    <div class="bg-muted rounded-md p-3">
      <dt class="text-muted-foreground text-xs">Contains profanity</dt>
      <dd class="mt-1 font-semibold">{detector.check(input) ? "Yes" : "No"}</dd>
    </div>
    <div class="bg-muted rounded-md p-3">
      <dt class="text-muted-foreground text-xs">Matches</dt>
      <dd class="mt-1 font-semibold">{matches.length}</dd>
    </div>
    <div class="bg-muted rounded-md p-3">
      <dt class="text-muted-foreground text-xs">Filtered output</dt>
      <dd class="mt-1 font-mono text-sm break-words">{filtered}</dd>
    </div>
  </dl>

  <div class="mt-5 flex items-center justify-between gap-3">
    <pre
      class="bg-muted min-w-0 flex-1 overflow-x-auto rounded-md p-3 text-xs"><code
        >{example}</code
      ></pre>
    <button
      type="button"
      on:click={copyExample}
      class="bg-primary text-primary-foreground shrink-0 rounded-md px-3 py-2 text-sm"
      >{copied ? "Copied" : "Copy code"}</button
    >
  </div>
</div>
