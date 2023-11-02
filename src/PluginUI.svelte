<script>
	import Tabs from "./components/tabs/tabs.svelte"
	import Labeling from "./pages/labeling.svelte"
	import {activeIndex} from "./stores";
	import Replicate from "./pages/Replicate.svelte";

	let index;

    activeIndex.subscribe(value => {
        index = value;
    });

</script>


<main>

    <Tabs/>
    {#if index === 0}
        <Labeling/>
    {:else if index === 1}
        <Replicate/>
    {/if}

</main>


<style global>
    * {
        padding: 0 !important;
        margin: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }

    main {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: start;
        block-size: 100%;
        padding: 0;
    }
</style>
