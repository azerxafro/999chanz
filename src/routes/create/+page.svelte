<script lang="ts">
  let boardSlug = "tech";
  let title = "";
  let body = "";
  let message = "";
  let submitting = false;

  const boardOptions = [
    { slug: "tech", label: "💻 Technology" },
    { slug: "random", label: "🎲 Random" },
    { slug: "adults", label: "🔞 Adults (NSFW)" },
  ];

  async function createThread() {
    if (!title.trim() || !body.trim() || submitting) return;
    submitting = true;
    message = "";

    try {
      const res = await fetch("/api/thread", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ boardSlug, title, body }),
      });
      const payload = await res.json();
      if (!res.ok) {
        message = payload.error ?? "Failed to create thread";
        return;
      }
      message = `✅ Thread created! Redirecting...`;
      setTimeout(() => {
        window.location.href = `/t/${payload.id}`;
      }, 800);
    } catch {
      message = "Network error";
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>New Thread — monadelta</title>
</svelte:head>

<div class="create-page">
  <h1 class="page-title">New Thread</h1>

  <div class="form">
    <div class="field">
      <label class="field-label" for="board-select">Board</label>
      <div class="board-chips">
        {#each boardOptions as opt}
          <button
            class="chip"
            class:chip-active={boardSlug === opt.slug}
            on:click={() => (boardSlug = opt.slug)}
            type="button"
          >
            {opt.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="thread-title">Title</label>
      <input
        id="thread-title"
        bind:value={title}
        placeholder="What's on your mind?"
        maxlength="200"
      />
    </div>

    <div class="field">
      <label class="field-label" for="thread-body">Opening Post</label>
      <textarea
        id="thread-body"
        rows="6"
        bind:value={body}
        placeholder="Write your first post…"
      ></textarea>
    </div>

    <button
      class="btn-primary"
      on:click={createThread}
      disabled={submitting || !title.trim() || !body.trim()}
    >
      {submitting ? "Creating…" : "Create Thread"}
    </button>

    {#if message}
      <p class="notice">{message}</p>
    {/if}
  </div>
</div>

<style>
  .create-page {
    max-width: 600px;
    margin: 0 auto;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .board-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    padding: 10px 16px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--panel);
    color: var(--text-secondary);
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all 0.2s;
    min-height: var(--touch-min);
    width: auto;
  }

  .chip:hover {
    border-color: var(--accent-2);
  }

  .chip-active {
    background: rgba(110, 231, 240, 0.1);
    border-color: var(--accent-2);
    color: var(--accent-2);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
