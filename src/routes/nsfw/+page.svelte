<script lang="ts">
  let message = '';

  async function accept() {
    const res = await fetch('/api/nsfw/accept', { method: 'POST' });
    const payload = await res.json();
    message = res.ok ? 'NSFW access unlocked.' : (payload.error ?? 'failed');
  }
</script>

<section class="pixel-card">
  <h1 class="title">age gate terminal</h1>
  <p class="body">Confirm you are 18+ to access NSFW boards and media.</p>
  <div class="form" style="margin-top:10px;">
    <button on:click={accept}>I am 18+</button>
    {#if message}<p class="notice">{message}</p>{/if}
  </div>
</section>
