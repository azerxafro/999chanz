<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  // Board Data
  type Board = {
    slug: string;
    name: string;
    description: string;
    nsfw: boolean;
  };
  let boards: Board[] = [];
  let loading = true;

  // Splash Screen State
  let splashVisible = false;
  let showContent = false;

  onMount(async () => {
    // Start splash sequence
    splashVisible = true;

    // Fetch data in background
    const res = await fetch("/api/boards");
    boards = await res.json();
    loading = false;

    // Splash animation timing
    setTimeout(() => {
      splashVisible = false;
      setTimeout(() => {
        showContent = true;
      }, 1000);
    }, 3000);
  });
</script>

{#if splashVisible}
  <div class="splash-container" transition:fade={{ duration: 1000 }}>
    <div
      class="splash-text"
      in:fly={{ y: 50, duration: 1000 }}
      out:fly={{ y: -50, duration: 1000 }}
    >
      Monaadelta Tech
    </div>
  </div>
{/if}

{#if showContent}
  <div class="main-content" in:fade={{ duration: 1000 }}>
    <h1 class="title">Uncensored Freedom</h1>

    <div class="grid boards">
      {#if loading}
        <p class="meta">loading cartridges...</p>
      {:else}
        {#each boards as board}
          <a class="pixel-card" href={`/b/${board.slug}`}>
            <h2 class="title" style="font-size: 1.5rem; margin-bottom: 0.5rem;">
              /{board.slug}/
            </h2>
            <p class="meta">{board.name}</p>
            <p class="body">{board.description}</p>
            {#if board.nsfw}<p class="meta" style="color: #ff3333;">
                🔞 nsfw board
              </p>{/if}
          </a>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap");

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Orbitron", sans-serif;
    background-color: #0d0d0d;
    color: #ffffff;
    overflow-x: hidden;
  }

  /* Splash Screen Styles */
  .splash-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    z-index: 9999;
  }

  .splash-text {
    font-size: 3rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2rem;
    background: linear-gradient(90deg, #ff00cc, #3333ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow:
      0 0 10px rgba(255, 0, 204, 0.5),
      0 0 20px rgba(51, 51, 255, 0.5);
  }

  /* Main Content Styles */
  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-transform: uppercase;
    color: #ff00cc;
    text-shadow: 0 0 10px rgba(255, 0, 204, 0.5);
  }

  .boards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
  }

  .pixel-card {
    border: 2px solid #333;
    padding: 1.5rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    background: #111;
  }

  .pixel-card:hover {
    border-color: #3333ff;
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(51, 51, 255, 0.2);
  }

  .pixel-card h2 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    color: #3333ff;
  }

  .meta {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .body {
    color: #ddd;
    line-height: 1.6;
  }
</style>
