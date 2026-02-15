<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
</script>

<div class="shell">
  <header class="pixel-card topbar">
    <div class="nav-row">
      <a class="nav-pill" href="/">boards</a>
      <a class="nav-pill" href="/create">new thread</a>
      <a class="nav-pill" href="/nsfw">nsfw gate</a>
      <a class="nav-pill" href="/auth/discord/start">login discord</a>
      <a class="nav-pill" href="/auth/logout">logout</a>
    </div>
    <div class="status">route: {$page.url.pathname} · 999chanz 8-bit mode</div>
  </header>

  <slot />
</div>
