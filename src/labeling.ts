export async function handleLabeling() {
    figma.ui.postMessage({type: "instruction", msg: "Select element(s) to label"})
    figma.on('selectionchange', async () => {
        const exportData = exportSelection()
        // const storageData = await extractForStorage()
        // console.log(storageData)
        // await figma.clientStorage.deleteAsync("selection")
        // await figma.clientStorage.setAsync("selection", storageData)
        // let fromStorage = await figma.clientStorage.getAsync("selection")
        // console.log("from storage: ", fromStorage)
        if (exportData.selection.length > 0) {
            figma.ui.postMessage(exportData)
        }
    })
}

export function handleSaveAndLabel(data) {
    console.log(data)
}


function exportSelection() {
    const selection = figma.currentPage.selection
    let names = []
    selection.forEach((item) => {
        if (item.name !== undefined) {
            if (names === []) {
                names = [{name: item.name, id: item.id, label: ""}]
            } else {
                names.push({name: item.name, id: item.id, label: ""})
            }
        }

    })
    return {type: "selection", selection: names}
}

async function extractForStorage() {
    const selection = figma.currentPage.selection
    let result = []
    let updated = []
    let fromStorage = await figma.clientStorage.getAsync("selection")
    if (fromStorage !== undefined && fromStorage !== []) {
        result = fromStorage
    }

    selection.forEach((selectedItem) => {
        result.forEach((storedItem) => {
            if (storedItem.id === selectedItem.id) {
                updated.push({id: storedItem.id, name: selectedItem.name})
            }
        })
    })
    // selection.forEach((item) => {
    //     prev = result.filter((storedItem) => {
    //         return storedItem.id !== item.id
    //     })
    //     // result.push({id: item.id, name: item.name})
    // })
    // prev.forEach((item) => {
    //     result.forEach((storedItem) => {
    //         if (storedItem.id === item.id) {
    //             result.push({id: item.id, name: item.name})
    //         }
    //     })
    // })
    return result
}
