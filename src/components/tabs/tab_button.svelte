<script>
    import {activeIndex} from "../../stores";

    export let active = false
    export let tabIndex = 0
    let btnClass = ""

    function toggleActive() {
        activeIndex.update((i) => i = tabIndex)
        activeIndex.subscribe(v => console.log(v))
    }

    activeIndex.subscribe((i) => i === tabIndex ? active = true : active = false)

</script>
<button class={active === true ? 'active' : ''}  on:click={toggleActive} >
    <slot/> </button>

<style>
    button {
        background: var(--figma-color-bg);
        border-top: 1px solid var(--figma-color-border);
        border-bottom: 1px solid var(--figma-color-border);
        border-left: 0;
        border-right: 0;
        color: var(--figma-color-text);
        padding-block: 0.5rem;
        padding-inline: 1rem;
        cursor: pointer;
        inline-size: 100%;
    }

    .active {
        border-bottom: 2px solid var(--figma-color-bg-inverse);
    }

    button:hover {
        background: var(--figma-color-bg-hover);
    }
</style>