export function handleSelection(event) {
    console.log("handle selection")
    let message = ""
    let elementLabels = []
    let elements = []
    if (event.data.pluginMessage.type === "selection") {
        console.log(event)
        const selection = event.data.pluginMessage.selection
        let labelToString = ""
        if (selection.length > 0) {
            selection.forEach((label) => {
                labelToString += label + ", "
            })
            labelToString = labelToString.slice(0, -2)

            selection.forEach((item) => {
                elements.push(item)
            })
        } else {
            message = "select element(s) to label"
        }

        message = `Selected: ${labelToString}`
    }
    elementLabels = elements
    return {elementLabels: elementLabels, message: message, elements: elements}
}