<script lang="ts">
  import { onMount, tick } from "svelte";
  export let data: { id: string };

  type Post = {
    id: string;
    author_name: string;
    body: string;
    created_at: string;
  };
  type Thread = {
    id: string;
    title: string;
    nsfw: boolean;
    posts: Post[];
  };

  let thread: Thread | null = null;
  let reply = "";
  let message = "";
  let loading = true;
  let sending = false;
  let postsContainer: HTMLElement;

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function loadThread() {
    try {
      const res = await fetch(`/api/t/${data.id}`);
      const payload = await res.json();
      if (!res.ok) {
        message = payload.error ?? "failed to load thread";
        return;
      }
      thread = payload;
      await tick();
      scrollToBottom();
    } catch {
      message = "Network error";
    } finally {
      loading = false;
    }
  }

  function scrollToBottom() {
    if (postsContainer) {
      postsContainer.scrollTop = postsContainer.scrollHeight;
    }
  }

  async function postReply() {
    if (!reply.trim() || sending) return;
    sending = true;
    message = "";

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId: data.id, body: reply }),
      });
      const payload = await res.json();
      if (!res.ok) {
        message = payload.error ?? "post failed";
        return;
      }
      reply = "";
      await loadThread();
    } catch {
      message = "Failed to send";
    } finally {
      sending = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postReply();
    }
  }

  onMount(loadThread);
</script>

<svelte:head>
  <title>{thread?.title ?? "Thread"} — monadelta</title>
</svelte:head>

{#if loading}
  <div class="grid">
    {#each [1, 2, 3] as _}
      <div class="skeleton"></div>
    {/each}
  </div>
{:else if !thread}
  <div class="card">
    <p class="meta" style="color: var(--danger)">
      {message || "Thread not found"}
    </p>
  </div>
{:else}
  <div class="thread-container">
    <!-- Thread Header -->
    <div class="thread-header">
      <h1 class="page-title">{thread.title}</h1>
      <div class="thread-info">
        <span class="meta">#{thread.id.slice(0, 8)}</span>
        {#if thread.nsfw}
          <span class="tag tag-nsfw">🔞 NSFW</span>
        {/if}
      </div>
    </div>

    <!-- Posts (chat-style) -->
    <div class="posts-scroll" bind:this={postsContainer}>
      {#each thread.posts as post, i}
        <article class="post-bubble">
          <div class="post-author">
            <span class="author-avatar"
              >{post.author_name.charAt(0).toUpperCase()}</span
            >
            <span class="author-name">{post.author_name}</span>
            <span class="post-time">{formatTime(post.created_at)}</span>
          </div>
          <div class="post-body">{post.body}</div>
        </article>
      {/each}
    </div>

    <!-- Sticky Reply Bar -->
    <div class="reply-bar">
      {#if message}
        <p class="notice" style="margin-bottom: 8px;">{message}</p>
      {/if}
      <div class="reply-input-row">
        <textarea
          class="reply-input"
          rows="1"
          bind:value={reply}
          on:keydown={handleKeyDown}
          placeholder="Type a reply…"
          disabled={sending}
        ></textarea>
        <button
          class="send-btn btn-primary"
          on:click={postReply}
          disabled={sending || !reply.trim()}
        >
          {sending ? "…" : "↑"}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .thread-container {
    display: flex;
    flex-direction: column;
    height: calc(100dvh - var(--nav-height) - var(--safe-bottom) - 32px);
  }

  .thread-header {
    flex-shrink: 0;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--line-subtle);
    margin-bottom: 12px;
  }

  .thread-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  /* ── Posts ─────────────── */
  .posts-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 12px;
    -webkit-overflow-scrolling: touch;
  }

  .post-bubble {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .post-author {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .author-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .author-name {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--accent-2);
  }

  .post-time {
    font-size: 0.7rem;
    color: var(--muted);
  }

  .post-body {
    background: var(--panel);
    border: 1px solid var(--line-subtle);
    border-radius: 0 var(--radius-md) var(--radius-md) var(--radius-md);
    padding: 12px 14px;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin-left: 36px;
  }

  /* ── Reply Bar ─────────── */
  .reply-bar {
    flex-shrink: 0;
    padding-top: 12px;
    border-top: 1px solid var(--line-subtle);
  }

  .reply-input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }

  .reply-input {
    flex: 1;
    min-height: 44px;
    max-height: 120px;
    resize: none;
    border-radius: var(--radius-lg);
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    padding: 0;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    .thread-container {
      height: calc(100vh - 120px);
    }

    .post-body {
      max-width: 70%;
    }
  }
</style>
