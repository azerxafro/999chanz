<script lang="ts">
  import { onMount } from 'svelte';

  type Board = { slug: string; name: string; description: string; nsfw: boolean };
  let boards: Board[] = [];
  let loading = true;

  onMount(async () => {
    const res = await fetch('/api/boards');
    boards = await res.json();
    loading = false;
  });
</script>

<section class="pixel-card">
  <h1 class="title">board select</h1>
  <div class="grid boards">
    {#if loading}
      <p class="meta">loading cartridges...</p>
    {:else}
      {#each boards as board}
        <a class="pixel-card" href={`/b/${board.slug}`}>
          <h2 class="title">/{board.slug}/</h2>
          <p class="meta">{board.name}</p>
          <p class="body">{board.description}</p>
          {#if board.nsfw}<p class="meta">🔞 nsfw board</p>{/if}
        </a>
      {/each}
    {/if}
  </div>
</section>
