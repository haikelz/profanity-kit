<script lang="ts">
  import { createDetector } from "profanity-kit/core";
  import { english } from "profanity-kit/languages/en";
  import { indonesian } from "profanity-kit/languages/id";

  type Language = "en" | "id" | "both";
  type Preset =
    | "basic"
    | "whole-word"
    | "indonesian"
    | "multiple"
    | "allow"
    | "custom";
  const presets: Record<
    Preset,
    {
      label: string;
      language: Language;
      input: string;
      blockList: string;
      allowList: string;
    }
  > = {
    basic: {
      label: "Basic detection",
      language: "en",
      input: "This is shit.",
      blockList: "",
      allowList: "",
    },
    "whole-word": {
      label: "Whole-word matching",
      language: "en",
      input: "classic assessment ass",
      blockList: "",
      allowList: "",
    },
    indonesian: {
      label: "Indonesian",
      language: "id",
      input: "Kata goblok",
      blockList: "",
      allowList: "",
    },
    multiple: {
      label: "Multiple languages",
      language: "both",
      input: "shit dan goblok",
      blockList: "",
      allowList: "",
    },
    allow: {
      label: "Allow list",
      language: "en",
      input: "Keep shit as-is",
      blockList: "",
      allowList: "shit",
    },
    custom: {
      label: "Custom block list",
      language: "en",
      input: "internalterm",
      blockList: "internalterm",
      allowList: "",
    },
  };

  let language: Language = "en";
  let preset: Preset = "basic";
  let input = "This is shit, but classic stays clean.";
  let blockList = "";
  let allowList = "";
  let replacement = "*";
  let copied = false;

  $: selectedLanguages =
    language === "both"
      ? [english, indonesian]
      : [language === "en" ? english : indonesian];
  $: detector = createDetector({
    languages: selectedLanguages,
    blockList: blockList
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean),
    allowList: allowList
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean),
    replacement: replacement || "*",
  });
  $: matches = detector.findAll(input);
  $: filtered = detector.filter(input);
  $: example = `${language === "en" ? 'import { createDetector } from "profanity-kit";' : 'import { createDetector } from "profanity-kit/core";'}${language !== "en" ? '\nimport { english } from "profanity-kit/languages/en";\nimport { indonesian } from "profanity-kit/languages/id";' : ""}\n\nconst detector = createDetector({${
    language === "en" &&
    !blockList &&
    !allowList &&
    (!replacement || replacement === "*")
      ? ""
      : `\n  ${language === "en" ? "" : `languages: [${language === "id" ? "indonesian" : "english, indonesian"}],`}\n  ${
          blockList
            ? `blockList: ${JSON.stringify(
                blockList
                  .split(",")
                  .map((word) => word.trim())
                  .filter(Boolean)
              )},`
            : ""
        }\n  ${
          allowList
            ? `allowList: ${JSON.stringify(
                allowList
                  .split(",")
                  .map((word) => word.trim())
                  .filter(Boolean)
              )},`
            : ""
        }\n  ${replacement && replacement !== "*" ? `replacement: ${JSON.stringify(replacement)},` : ""}\n`
  }});\ndetector.filter(${JSON.stringify(input)});`;

  function applyPreset(value: Preset) {
    preset = value;
    const next = presets[value];
    language = next.language;
    input = next.input;
    blockList = next.blockList;
    allowList = next.allowList;
    replacement = "*";
  }

  async function copyExample() {
    await navigator.clipboard.writeText(example);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div
  class="not-prose border-border bg-card mt-3 rounded-xl border p-5 shadow-sm"
>
  <label class="grid gap-1 text-sm font-medium">
    Example preset
    <select
      bind:value={preset}
      on:change={() => applyPreset(preset)}
      class="border-border bg-background rounded-md border px-3 py-2 font-normal"
    >
      {#each Object.entries(presets) as [value, option]}
        <option {value}>{option.label}</option>
      {/each}
    </select>
  </label>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <label class="grid gap-1 text-sm font-medium">
      Language
      <select
        bind:value={language}
        class="border-border bg-background rounded-md border px-3 py-2 font-normal"
      >
        <option value="en">English</option>
        <option value="id">Indonesian</option>
        <option value="both">English + Indonesian</option>
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
    ></textarea>
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

  <dl class="mt-5 grid gap-3 sm:grid-cols-4">
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
    <div class="bg-muted rounded-md p-3">
      <dt class="text-muted-foreground text-xs">isClean()</dt>
      <dd class="mt-1 font-semibold">
        {detector.isClean(input) ? "true" : "false"}
      </dd>
    </div>
  </dl>

  {#if matches.length > 0}
    <ul class="mt-4 grid gap-2 text-sm">
      {#each matches as match}
        <li class="border-border rounded-md border p-2">
          <code>{match.value}</code> · {match.start}–{match.end} · {match.languages.join(
            ", "
          )}
        </li>
      {/each}
    </ul>
  {/if}

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
