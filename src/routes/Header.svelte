<script lang="ts">
	let { onAlphaModalClick } = $props();
</script>

<header>
	<div class="header-content">
		<h1>Propensity to Cycle Tool for Northern Ireland</h1>
		<div class="header-right">
			<button
				class="alpha-box"
				onclick={onAlphaModalClick}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAlphaModalClick(); }}
				aria-label="Show alpha information"
				type="button"
			>
				<span class="alpha-text">ALPHA</span>
			</button>
			<div class="logos-right">
				<a href="https://www.infrastructure-ni.gov.uk/" target="_blank" rel="noopener noreferrer" aria-label="Visit Infrastructure NI website">
					<img src="/ini-logo-long.png" alt="Infrastructure NI" class="logo ini-logo" />
				</a>
				<a href="https://aecom.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit AECOM website">
					<img src="/aecom-logo.png" alt="AECOM" class="logo aecom-logo" />
				</a>
				<a href="https://environment.leeds.ac.uk/transport" target="_blank" rel="noopener noreferrer" aria-label="Visit University of Leeds Transport Studies website">
					<img src="/leeds-logo.png" alt="University of Leeds" class="logo leeds-logo" />
				</a>
			</div>
		</div>
	</div>
</header>

<style>
	header {
		padding: 1em;
		background-color: #f0f0f0;
		border-bottom: 1px solid #ccc;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.alpha-box {
		background-color: #00703c;
		color: white;
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		transition: background-color 0.2s;
		border: none;
		font-family: inherit;
	}

	.alpha-box:hover {
		background-color: #005a30;
	}

	.alpha-box:focus {
		outline: 2px solid #ffdd00;
		outline-offset: 2px;
	}

	.logos-right {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.logos-right a {
		display: inline-block;
		transition: opacity 0.2s ease, transform 0.2s ease;
		text-decoration: none;
	}

	.logos-right a:hover {
		opacity: 0.8;
		transform: scale(1.05);
	}

	.logo {
		height: 40px;
		width: auto;
		object-fit: contain;
		display: block;
	}

	h1 {
		margin: 0;
		font-size: 1.5em;
		color: #333;
		text-align: left;
		flex: 1;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			justify-content: center;
			gap: 1rem;
		}

		.header-right {
			order: 2;
		}

		.logos-right {
			order: 2;
		}

		h1 {
			order: 1;
			font-size: 1.3em;
			text-align: center;
		}
		
		.logo {
			height: 35px;
		}

		.alpha-box {
			font-size: 0.8rem;
			padding: 0.25rem 0.5rem;
		}
	}

	@media (max-width: 480px) {
		header {
			padding: 0.8em;
		}

		.header-content {
			gap: 0.8rem;
		}

		.logos-right {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.logo {
			height: 30px;
		}
		
		h1 {
			font-size: 1.2em;
		}
	}
</style>
