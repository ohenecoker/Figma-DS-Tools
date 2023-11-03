export function handleSelection(event) {
    let message = ""
    let elementLabels = []
    let elements = []
    let selection = []
    if (event.data.pluginMessage.type === "selection") {
        selection = event.data.pluginMessage.selection
        console.log(selection)
        let labelToString = ""
        if (selection.length > 0) {
            selection.forEach((label) => {
                labelToString += label.name + ", "
            })
            labelToString = labelToString.slice(0, -2)

            selection.forEach((item) => {
                elements.push(item.name)
            })
            // console.log(elements)
        } else {
            message = "select element(s) to label"
        }

        message = `Selected: ${labelToString}`
    }
    elementLabels = elements
    return {elementLabels: elementLabels, message: message, elements: elements, selection: selection}
}