<script>
    import {activeIndex} from "../../stores";
    import {handleSelection} from "./handle_selection";
    import {Button, Input} from "figma-plugin-ds-svelte";

    let isActive = false;

    let message = ""
    let selections = []

    let labels = []
    $: elementLabels = labels

    activeIndex.subscribe((v) => {
        isActive = v === 0;
        parent.postMessage({pluginMessage: {activeTab: "labeling"}}, "*")
    })
    onmessage = (event) => {
        let elements = []
        let result = {}
        if (event.data.pluginMessage.type === "instruction") {
            message = event.data.pluginMessage.msg
        }
        if (event.data.pluginMessage.type === "selection") {
            result = handleSelection(event)
            elements = result.elements
            message = result.message
            elementLabels = result.elementLabels
            selections = result.selection
            // console.log(result)
        }
    }

    function handleInputChange() {
        console.log("change")
        parent.postMessage({pluginMessage: {type: "addLabels", data: selections}}, "*")
    }

</script>
<main>
    {#if elementLabels !== undefined && elementLabels.length === 0}
        <div class="message">
            <p>{message}</p>
        </div>
    {/if}
    <div class="selection">
        {#if elementLabels !== undefined && elementLabels.length !== 0}
            <p>Selected elements</p>
        {/if}
        {#each elementLabels as item, i}
            <div class="unit">
                <Input bind:value={selections[i].label} on:change={handleInputChange} class="input"
                       placeholder={item}/>
                <Button>Add Label</Button>
            </div>
        {/each}
    </div>
</main>

<style>
    main {
        display: grid;
        gap: 16px;
        padding: 16px;
        place-items: center;
        inline-size: 100%;
        block-size: 100%;
        background-color: var(--figma-color-background);
    }

    .selection {
        display: grid;
        gap: 16px;
        inline-size: 80%;
        block-size: 100%;
        grid-auto-rows: 24px;
    }

    .message {
        display: grid;
        place-content: center;
        place-items: center;
        inline-size: 100%;
        block-size: 100%;
    }

    .message > p {
        block-size: 16px;
    }

    .unit {
        display: grid;
        grid-template-columns: 1fr minmax(5ch, auto);
        block-size: fit-content;
        gap: 16px;
        inline-size: 100%;
    }

    p {
        color: var(--figma-color-text);
    }

</style>