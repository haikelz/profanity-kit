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
  $: example = generateExample(
    language,
    input,
    blockList,
    allowList,
    replacement
  );

  function generateExample(
    selectedLanguage: Language,
    selectedInput: string,
    selectedBlockList: string,
    selectedAllowList: string,
    selectedReplacement: string
  ) {
    const imports = [
      'import { createDetector } from "profanity-kit/core";',
      ...(selectedLanguage !== "id"
        ? ['import { english } from "profanity-kit/languages/en";']
        : []),
      ...(selectedLanguage !== "en"
        ? ['import { indonesian } from "profanity-kit/languages/id";']
        : []),
    ];
    const languageOption =
      selectedLanguage === "en"
        ? "english"
        : selectedLanguage === "id"
          ? "indonesian"
          : "english, indonesian";
    const options = [`languages: [${languageOption}],`];

    if (selectedBlockList) {
      options.push(
        `blockList: ${JSON.stringify(
          selectedBlockList
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean)
        )},`
      );
    }
    if (selectedAllowList) {
      options.push(
        `allowList: ${JSON.stringify(
          selectedAllowList
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean)
        )},`
      );
    }
    options.push(`replacement: ${JSON.stringify(selectedReplacement || "*")},`);

    const detector = `const detector = createDetector({\n${options.map((option) => `  ${option}`).join("\n")}\n});`;

    return `${imports.join("\n")}\n\n${detector}\ndetector.filter(${JSON.stringify(selectedInput)});`;
  }

  function applyPreset(value: Preset) {
    preset = value;
    const next = presets[value];
    language = next.language;
    input = next.input;
    blockList = next.blockList;
    allowList = next.allowList;
    replacement = "*";
  }

  function formatLanguage(code: string) {
    return code === "en" ? "English" : code === "id" ? "Indonesian" : code;
  }

  async function copyExample() {
    await navigator.clipboard.writeText(example);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div
  class="not-prose border-border bg-card mt-3 rounded-xl border p-4 shadow-sm sm:p-6"
>
  <div
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(7rem,0.5fr)]"
  >
    <label
      class="grid min-w-0 content-start gap-1.5 text-sm font-medium md:col-span-2 lg:col-span-1"
    >
      Example preset
      <select
        bind:value={preset}
        on:change={() => applyPreset(preset)}
        class="border-border bg-background focus-visible:ring-ring min-h-10 w-full min-w-0 rounded-lg border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {#each Object.entries(presets) as [value, option]}
          <option {value}>{option.label}</option>
        {/each}
      </select>
    </label>
    <label class="grid min-w-0 gap-1.5 text-sm font-medium">
      Language
      <select
        bind:value={language}
        class="border-border bg-background focus-visible:ring-ring min-h-10 w-full min-w-0 rounded-lg border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <option value="en">English</option>
        <option value="id">Indonesian</option>
        <option value="both">English + Indonesian</option>
      </select>
    </label>
    <label class="grid min-w-0 gap-1.5 text-sm font-medium">
      Replacement
      <input
        bind:value={replacement}
        maxlength="1"
        class="border-border bg-background focus-visible:ring-ring min-h-10 w-full min-w-0 rounded-lg border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />
    </label>
  </div>

  <label class="mt-5 grid min-w-0 gap-1.5 text-sm font-medium">
    Text to inspect
    <textarea
      bind:value={input}
      rows="4"
      maxlength="280"
      class="border-border bg-background focus-visible:ring-ring min-h-28 w-full min-w-0 resize-y rounded-lg border px-3 py-2.5 leading-relaxed font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    ></textarea>
  </label>

  <div class="mt-4 grid gap-4 md:grid-cols-2">
    <label class="grid min-w-0 gap-1.5 text-sm font-medium">
      <span
        >Block list <span class="text-muted-foreground font-normal"
          >· comma-separated</span
        ></span
      >
      <input
        bind:value={blockList}
        class="border-border bg-background focus-visible:ring-ring min-h-10 w-full min-w-0 rounded-lg border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />
    </label>
    <label class="grid min-w-0 gap-1.5 text-sm font-medium">
      <span
        >Allow list <span class="text-muted-foreground font-normal"
          >· comma-separated</span
        ></span
      >
      <input
        bind:value={allowList}
        class="border-border bg-background focus-visible:ring-ring min-h-10 w-full min-w-0 rounded-lg border px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />
    </label>
  </div>

  <dl class="mt-6 grid gap-3 sm:grid-cols-3">
    <div class="bg-muted rounded-lg p-3">
      <dt class="text-muted-foreground text-xs">Contains profanity</dt>
      <dd class="mt-1 font-semibold">{detector.check(input) ? "Yes" : "No"}</dd>
    </div>
    <div class="bg-muted rounded-lg p-3">
      <dt class="text-muted-foreground text-xs">Matches</dt>
      <dd class="mt-1 font-semibold">{matches.length}</dd>
    </div>
    <div class="bg-muted rounded-lg p-3">
      <dt class="text-muted-foreground text-xs">isClean()</dt>
      <dd class="mt-1 font-semibold">
        {detector.isClean(input) ? "true" : "false"}
      </dd>
    </div>
  </dl>

  <section class="mt-5 grid gap-1.5" aria-labelledby="filtered-output-heading">
    <h3 id="filtered-output-heading" class="text-sm font-semibold">
      Filtered output
    </h3>
    <div
      class="border-border bg-background min-w-0 rounded-lg border px-4 py-3"
    >
      <p
        class="font-mono text-sm leading-relaxed break-words whitespace-pre-wrap"
      >
        {filtered}
      </p>
    </div>
  </section>

  {#if matches.length > 0}
    <section class="mt-4" aria-labelledby="detected-matches-heading">
      <div class="mb-2 flex items-center justify-between gap-3">
        <h3 id="detected-matches-heading" class="text-sm font-semibold">
          Detected matches
        </h3>
        <span class="text-muted-foreground text-xs">
          {matches.length}
          {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <ul
        class="border-border bg-background divide-border divide-y overflow-hidden rounded-lg border text-sm"
      >
        {#each matches as match}
          <li
            class="grid min-w-0 gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-4"
          >
            <div class="min-w-0">
              <span class="text-muted-foreground block text-xs"
                >Matched word</span
              >
              <code class="mt-1 inline-block max-w-full truncate font-semibold">
                {match.value}
              </code>
            </div>
            <div>
              <span class="text-muted-foreground block text-xs"
                >Character range</span
              >
              <span class="mt-1 block font-mono">{match.start}–{match.end}</span
              >
            </div>
            <div class="sm:min-w-24">
              <span class="text-muted-foreground block text-xs">Language</span>
              <span class="mt-1 block">
                {match.languages.map(formatLanguage).join(", ")}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="bg-muted relative mt-6 overflow-hidden rounded-lg">
    <div
      class="border-border flex items-center justify-between border-b px-3 py-2"
    >
      <span class="text-muted-foreground text-xs font-medium"
        >Generated example</span
      >
      <button
        type="button"
        on:click={copyExample}
        class="bg-primary text-primary-foreground focus-visible:ring-ring min-h-9 shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-[scale,opacity] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-96"
        >{copied ? "Copied" : "Copy code"}</button
      >
    </div>
    <pre class="min-w-0 overflow-x-auto p-4 text-xs leading-relaxed"><code
        >{example}</code
      ></pre>
  </div>
</div>
