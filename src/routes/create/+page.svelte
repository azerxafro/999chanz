<script lang="ts">
  let boardSlug = 'tech';
  let title = '';
  let body = '';
  let message = '';

  async function createThread() {
    const res = await fetch('/api/thread', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ boardSlug, title, body })
    });
    const payload = await res.json();
    if (!res.ok) {
      message = payload.error ?? 'failed';
      return;
    }
    message = `created thread ${payload.id}`;
  }
</script>

<section class="pixel-card">
  <h1 class="title">spawn new thread</h1>
  <div class="form">
    <input bind:value={boardSlug} placeholder="board slug (tech/random/adults)" />
    <input bind:value={title} placeholder="thread title" />
    <textarea rows="6" bind:value={body} placeholder="opening post"></textarea>
    <button on:click={createThread}>create</button>
    {#if message}<p class="notice">{message}</p>{/if}
  </div>
</section>
