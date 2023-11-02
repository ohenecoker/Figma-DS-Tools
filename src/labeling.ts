export function handleLabeling() {
    figma.ui.postMessage({type: "instruction", msg: "Select element(s) to label"})
    figma.on('selectionchange', () => {
        const selection = figma.currentPage.selection
        console.log("selected something: ", selection)
        let names = []
        selection.forEach((item) => {
            if (item.name !== undefined) {
                if (names === []) {
                    names = [item.name]
                } else {
                    names.push(item.name)
                }
            }

        })
        const message = {type: "selection", selection: names}
        if (message.selection.length > 0) {
            figma.ui.postMessage(message)
        }
    })
}