<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  type Board = {
    slug: string;
    name: string;
    description: string;
    nsfw: boolean;
  };

  let boards: Board[] = [];
  let loading = true;
  let splashVisible = false;
  let showContent = false;

  onMount(async () => {
    splashVisible = true;

    try {
      const res = await fetch("/api/boards");
      boards = await res.json();
    } catch (e) {
      console.error("Failed to fetch boards:", e);
    }
    loading = false;

    setTimeout(() => {
      splashVisible = false;
      setTimeout(() => {
        showContent = true;
      }, 400);
    }, 1400);
  });
</script>

<svelte:head>
  <title>monadelta — Uncensored Freedom</title>
  <meta
    name="description"
    content="monadelta — anonymous chanboard for uncensored expression"
  />
</svelte:head>

{#if splashVisible}
  <div class="splash" transition:fade={{ duration: 400 }}>
    <div
      class="splash-brand"
      in:fly={{ y: 20, duration: 600 }}
      out:fly={{ y: -12, duration: 400 }}
    >
      <span class="splash-logo">◆</span>
      <span class="splash-name">monadelta</span>
    </div>
    <p class="splash-tag" in:fade={{ delay: 300, duration: 500 }}>
      uncensored freedom
    </p>
  </div>
{/if}

{#if showContent}
  <div in:fade={{ duration: 400 }}>
    <h1 class="page-title">Boards</h1>

    <div class="grid boards-grid">
      {#if loading}
        {#each [1, 2, 3] as _}
          <div class="skeleton"></div>
        {/each}
      {:else}
        {#each boards as board}
          <a class="card card-interactive board-card" href={`/b/${board.slug}`}>
            <div class="board-header">
              <span class="board-slug">/{board.slug}/</span>
              {#if board.nsfw}
                <span class="tag tag-nsfw">🔞 NSFW</span>
              {/if}
            </div>
            <h2 class="board-name">{board.name}</h2>
            <p class="body-text">{board.description}</p>
            <div class="board-arrow">→</div>
          </a>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ── Splash (compact on mobile) ── */
  .splash {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--bg);
    z-index: 9999;
    gap: 6px;
    padding: 0 24px;
  }

  .splash-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .splash-logo {
    font-size: 1.6rem;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .splash-name {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .splash-tag {
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* ── Board Cards ────────────── */
  .board-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
  }

  .board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .board-slug {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent-2);
    font-family: "SF Mono", "Fira Code", monospace;
  }

  .board-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
  }

  .board-arrow {
    position: absolute;
    right: 16px;
    bottom: 16px;
    font-size: 1.2rem;
    color: var(--muted);
    transition:
      transform 0.2s,
      color 0.2s;
  }

  .board-card:hover .board-arrow {
    transform: translateX(4px);
    color: var(--accent-2);
  }

  /* ── Scale up on desktop ──── */
  @media (min-width: 768px) {
    .splash-logo {
      font-size: 2.5rem;
    }
    .splash-name {
      font-size: 2rem;
    }
    .splash-tag {
      font-size: 0.9rem;
    }
    .splash-brand {
      gap: 12px;
    }
    .splash {
      gap: 12px;
    }
  }
</style>
