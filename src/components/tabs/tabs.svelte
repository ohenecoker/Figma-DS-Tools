<script>
    import TabButton from "./tab_button.svelte"
    import {activeIndex} from "../../stores";

    let index = 0


    let tabData = [
        {name: "Tab 1", active: false},
        {name: "Tab 2", active: false},
        {name: "Tab 3", active: false},
        {name: "Tab 4", active: false},
    ]
    function updateIndex(newIndex) {
        index = newIndex
        console.log(index)
    }



</script><nav>
    {#each tabData as tab, i}
        <TabButton tabIndex={i}>{tab.name}</TabButton>
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