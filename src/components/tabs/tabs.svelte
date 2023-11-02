<script>
    import TabButton from "./tab_button.svelte"
    import {tabNames} from "../../stores";

    let tabData = []

    tabNames.subscribe(v => v.map((name) => tabData.push(name)))
</script>
<nav>
    {#each tabData as tab, i}
        <TabButton tabIndex={i}>{tab}</TabButton>
    {/each}
</nav>

<style>
    nav {
        display: flex;
        flex-flow: row nowrap;
        inline-size: 100%;
        justify-content: stretch;
    }
</style>