<svelte:head>
	<title>369 Singularity Splash</title>
	<meta
		name="description"
		content="A 369 splash screen symbolizing singularity and oneness with a calm loading animation."
	/>
</svelte:head>

<main class="splash-screen" aria-live="polite" aria-label="Loading splash screen">
	<div class="halo" aria-hidden="true"></div>
	<p class="label">Singularity • Oneness</p>
	<h1 class="number" aria-label="369">369</h1>
	<div class="loader" aria-hidden="true"></div>
	<p class="status">Loading...</p>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		background: #04020b;
	}

	.splash-screen {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 0.75rem;
		background:
			radial-gradient(circle at 50% 40%, rgba(126, 53, 255, 0.3), transparent 45%),
			radial-gradient(circle at 50% 75%, rgba(12, 160, 255, 0.15), transparent 55%),
			#04020b;
		color: #f8f6ff;
		text-align: center;
		overflow: hidden;
	}

	.halo {
		position: absolute;
		width: min(55vw, 22rem);
		aspect-ratio: 1;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		box-shadow:
			0 0 2rem rgba(126, 53, 255, 0.45),
			inset 0 0 2rem rgba(12, 160, 255, 0.25);
		animation: pulse 3s ease-in-out infinite;
	}

	.label {
		position: relative;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-size: clamp(0.65rem, 1.4vw, 0.9rem);
		opacity: 0.85;
	}

	.number {
		position: relative;
		margin: 0;
		line-height: 1;
		font-size: clamp(4rem, 16vw, 10rem);
		letter-spacing: 0.12em;
		text-shadow:
			0 0 1rem rgba(255, 255, 255, 0.25),
			0 0 2rem rgba(126, 53, 255, 0.55),
			0 0 3rem rgba(12, 160, 255, 0.55);
		animation: glow 2.6s ease-in-out infinite;
	}

	.loader {
		position: relative;
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
		border: 3px solid rgba(248, 246, 255, 0.2);
		border-top-color: #a782ff;
		border-right-color: #47d3ff;
		animation: spin 1s linear infinite;
	}

	.status {
		position: relative;
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.75;
		letter-spacing: 0.05em;
		animation: fade 1.8s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(0.96);
			opacity: 0.5;
		}
		50% {
			transform: scale(1.04);
			opacity: 0.85;
		}
	}

	@keyframes glow {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.15em);
		}
	}

	@keyframes fade {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 0.9;
		}
	}
</style>
