<script lang="ts">
  let message = "";
  let accepted = false;

  async function accept() {
    try {
      const res = await fetch("/api/nsfw/accept", { method: "POST" });
      const payload = await res.json();
      if (res.ok) {
        accepted = true;
        message = "🔓 NSFW access unlocked";
      } else {
        message = payload.error ?? "Failed";
      }
    } catch {
      message = "Network error";
    }
  }
</script>

<svelte:head>
  <title>Age Gate — monadelta</title>
</svelte:head>

<div class="gate-page">
  <div class="gate-card card">
    <div class="gate-icon">🔞</div>
    <h1 class="gate-title">Age Verification</h1>
    <p class="body-text gate-body">
      You must confirm you are 18 years or older to access NSFW boards and media
      content.
    </p>

    {#if accepted}
      <div class="gate-success">
        <span class="success-icon">✅</span>
        <p>{message}</p>
      </div>
    {:else}
      <button class="btn-primary gate-btn" on:click={accept}>
        I am 18+ — Unlock Access
      </button>
    {/if}

    {#if message && !accepted}
      <p class="notice" style="color: var(--danger);">{message}</p>
    {/if}

    <p class="meta gate-disclaimer">
      By continuing, you acknowledge you understand the content may be explicit.
    </p>
  </div>
</div>

<style>
  .gate-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 20px;
  }

  .gate-card {
    max-width: 420px;
    width: 100%;
    text-align: center;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .gate-icon {
    font-size: 3rem;
  }

  .gate-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text);
  }

  .gate-body {
    max-width: 320px;
    text-align: center;
  }

  .gate-btn {
    width: 100%;
    max-width: 280px;
    padding: 14px 24px;
    font-size: 0.95rem;
  }

  .gate-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--success);
    font-weight: 600;
  }

  .success-icon {
    font-size: 2rem;
  }

  .gate-disclaimer {
    font-size: 0.7rem;
    max-width: 300px;
    text-align: center;
    margin-top: 8px;
  }
</style>
