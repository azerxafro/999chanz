<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";

  export let data: { user: { id: string; username: string } | null };

  $: pathname = $page.url.pathname;
  $: isHome = pathname === "/";
  $: isCreate = pathname === "/create";
  $: isNsfw = pathname === "/nsfw";
  $: loggedIn = !!data.user;
</script>

<svelte:head>
  <meta name="theme-color" content="#0a0a12" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta
    name="apple-mobile-web-app-status-bar-style"
    content="black-translucent"
  />
</svelte:head>

<div class="shell">
  <!-- Desktop top nav (hidden on mobile) -->
  <header class="desktop-nav">
    <a class="brand" href="/">monadelta</a>
    <nav class="desktop-links">
      <a href="/" class:active={isHome}>Boards</a>
      <a href="/create" class:active={isCreate}>New Thread</a>
      <a href="/nsfw" class:active={isNsfw}>NSFW Gate</a>
      <a
        class="auth-toggle"
        class:logged-in={loggedIn}
        href={loggedIn ? "/auth/logout" : "/auth/discord/start"}
      >
        <span class="auth-icon">{loggedIn ? "🟢" : "⚫"}</span>
        <span>{loggedIn ? (data.user?.username ?? "Logout") : "Login"}</span>
      </a>
    </nav>
  </header>

  <main>
    <slot />
  </main>
</div>

<!-- Mobile bottom nav -->
<nav class="bottom-nav">
  <a class="nav-item" href="/" class:active={isHome}>
    <span class="nav-icon">🏠</span>
    <span>Boards</span>
  </a>
  <a class="nav-item" href="/create" class:active={isCreate}>
    <span class="nav-icon">✏️</span>
    <span>Create</span>
  </a>
  <a class="nav-item" href="/nsfw" class:active={isNsfw}>
    <span class="nav-icon">🔞</span>
    <span>Gate</span>
  </a>
  <a
    class="nav-item auth-nav"
    class:logged-in={loggedIn}
    href={loggedIn ? "/auth/logout" : "/auth/discord/start"}
  >
    <span class="nav-icon">{loggedIn ? "🟢" : "🔑"}</span>
    <span>{loggedIn ? "You" : "Login"}</span>
  </a>
</nav>

<style>
  main {
    padding-top: 16px;
    min-height: 70vh;
  }

  /* ── Desktop Nav ─────────────────── */
  .desktop-nav {
    display: none;
  }

  .brand {
    font-weight: 700;
    font-size: 1.2rem;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .desktop-links {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .desktop-links a {
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .desktop-links a:hover {
    background: var(--panel);
    color: var(--text);
  }

  .desktop-links a.active {
    background: var(--panel);
    color: var(--accent);
  }

  /* ── Auth Toggle ───────────────── */
  .auth-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px !important;
    border-radius: 100px !important;
    border: 1px solid var(--line);
    transition: all 0.2s ease;
  }

  .auth-toggle.logged-in {
    border-color: var(--success);
    background: rgba(80, 250, 123, 0.08) !important;
    color: var(--success) !important;
  }

  .auth-toggle:not(.logged-in) {
    border-color: var(--accent);
    background: rgba(255, 95, 162, 0.08) !important;
    color: var(--accent) !important;
  }

  .auth-icon {
    font-size: 0.6rem;
    line-height: 1;
  }

  .auth-nav.logged-in {
    color: var(--success);
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      margin-bottom: 8px;
      border-bottom: 1px solid var(--line-subtle);
    }

    main {
      padding-top: 0;
    }
  }
</style>
