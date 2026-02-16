<script lang="ts">
  import { onMount } from "svelte";
  export let data: { slug: string };

  type ThreadItem = {
    id: string;
    title: string;
    postCount: number;
    created_at: string;
    nsfw: boolean;
  };

  let boardName = data.slug;
  let threads: ThreadItem[] = [];
  let error = "";
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch(`/api/b/${data.slug}`);
      const payload = await res.json();
      if (!res.ok) {
        error = payload.error ?? "failed to load";
        return;
      }
      boardName = payload.board.name;
      threads = payload.threads;
    } catch (e) {
      error = "Network error";
    } finally {
      loading = false;
    }
  });

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }
</script>

<svelte:head>
  <title>/{data.slug}/ — monadelta</title>
</svelte:head>

<div class="board-header-section">
  <h1 class="page-title">/{data.slug}/</h1>
  <p class="meta">{boardName}</p>
</div>

{#if error}
  <div class="card">
    <p class="meta" style="color: var(--danger)">{error}</p>
  </div>
{:else if loading}
  <div class="grid">
    {#each [1, 2, 3] as _}
      <div class="skeleton"></div>
    {/each}
  </div>
{:else if threads.length === 0}
  <div class="card empty-state">
    <p class="empty-icon">💬</p>
    <p class="body-text">No threads yet. Be the first to create one!</p>
  </div>
{:else}
  <div class="grid">
    {#each threads as thread}
      <a class="card card-interactive thread-card" href={`/t/${thread.id}`}>
        <div class="thread-top">
          <h2 class="thread-title">{thread.title}</h2>
          {#if thread.nsfw}
            <span class="tag tag-nsfw">🔞</span>
          {/if}
        </div>
        <div class="thread-meta">
          <span class="tag tag-count">{thread.postCount} posts</span>
          <span class="meta">{timeAgo(thread.created_at)}</span>
        </div>
      </a>
    {/each}
  </div>
{/if}

<a class="fab" href="/create" title="New Thread">+</a>

<style>
  .board-header-section {
    margin-bottom: 20px;
  }

  .thread-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }

  .thread-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .thread-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    flex: 1;
  }

  .thread-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 2rem;
  }
</style>
