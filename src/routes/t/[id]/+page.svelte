<script lang="ts">
  import { onMount } from 'svelte';
  export let data: { id: string };

  type Post = { id: string; authorName: string; body: string; createdAt: number };
  type Thread = { id: string; title: string; posts: Post[]; nsfw: boolean };

  let thread: Thread | null = null;
  let reply = '';
  let message = '';

  async function loadThread() {
    const res = await fetch(`/api/t/${data.id}`);
    const payload = await res.json();
    if (!res.ok) {
      message = payload.error ?? 'failed to load thread';
      return;
    }
    thread = payload;
  }

  async function postReply() {
    const res = await fetch('/api/post', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ threadId: data.id, body: reply })
    });
    const payload = await res.json();
    if (!res.ok) {
      message = payload.error ?? 'post failed';
      return;
    }
    message = `posted ${payload.postId}`;
    reply = '';
    await loadThread();
  }

  onMount(loadThread);
</script>

<section class="pixel-card">
  {#if thread}
    <h1 class="title">{thread.title}</h1>
    <p class="meta">thread #{thread.id} {thread.nsfw ? '· 🔞' : ''}</p>
    <div class="grid" style="margin-top:10px;">
      {#each thread.posts as post}
        <article class="pixel-card">
          <p class="meta">{post.id} · {post.authorName}</p>
          <p class="body">{post.body}</p>
        </article>
      {/each}
    </div>

    <div class="pixel-card" style="margin-top:10px;">
      <h2 class="title">quick reply</h2>
      <div class="form">
        <textarea rows="5" bind:value={reply} placeholder="type your post"></textarea>
        <button on:click={postReply}>send post</button>
        {#if message}<p class="notice">{message}</p>{/if}
      </div>
    </div>
  {:else}
    <p class="meta">loading thread...</p>
    {#if message}<p class="meta">{message}</p>{/if}
  {/if}
</section>
