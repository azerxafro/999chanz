<script lang="ts">
  import { onMount } from 'svelte';
  export let data: { slug: string };

  type ThreadList = { id: string; title: string; postCount: number; createdAt: number; nsfw: boolean };
  let boardName = data.slug;
  let threads: ThreadList[] = [];
  let error = '';

  onMount(async () => {
    const res = await fetch(`/api/b/${data.slug}`);
    const payload = await res.json();
    if (!res.ok) {
      error = payload.error ?? 'failed to load';
      return;
    }
    boardName = payload.board.name;
    threads = payload.threads;
  });
</script>

<section class="pixel-card">
  <h1 class="title">/{data.slug}/ · {boardName}</h1>
  {#if error}
    <p class="meta">{error}</p>
  {:else if threads.length === 0}
    <p class="meta">no threads yet</p>
  {:else}
    <div class="grid">
      {#each threads as thread}
        <a class="pixel-card" href={`/t/${thread.id}`}>
          <h2 class="title">{thread.title}</h2>
          <p class="meta">posts: {thread.postCount} {thread.nsfw ? '· 🔞' : ''}</p>
        </a>
      {/each}
    </div>
  {/if}
</section>
