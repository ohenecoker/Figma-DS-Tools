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

export async function handleSaveAndLabelll(data) {
    console.clear()
    let updated = []
    let deduped = []
    console.log("edited: ", data)
    let fromStorage = await figma.clientStorage.getAsync("selection")
    console.log("from storage: ", fromStorage)


    if (fromStorage === undefined) {
        console.log("no storage")
        updated = data
        await figma.clientStorage.setAsync("selection", [data])
    } else {
        console.log("storage exists")
        data.forEach((item) => {
            fromStorage.forEach((storedItem) => {
                if (storedItem.id === item.id) {
                    if (containsItem(updated, item) == false) {
                        storedItem.name = item.name
                        storedItem.label = item.label
                        updated.push(storedItem)
                    }
                } else {
                    if (containsItem(updated, item) == false) {
                        updated.push(item)
                    }
                }
            })
        })
    }
    updated = removeDuplicates(updated)

    console.log(updated)
    await figma.clientStorage.setAsync("selection", updated)
}

interface LabelData {
    name: string,
    id: string,
    label: string
}

export async function handleSaveAndLabel(data: LabelData[]) {
    let clientStorage: [] = await figma.clientStorage.getAsync("selection")
    let stored: LabelData[] = clientStorage
    let incoming = Array.from(data)
    let all: LabelData[] = []

    console.log("data: ", incoming)
    console.log("stored init: ", stored)
    stored = updateStored(incoming, stored)
    console.log("stored after: ", stored)
    incoming = pruneDups(incoming, stored)
    console.log("incoming: ", incoming)
    all = [...incoming, ...stored]
    console.log("all: ", all)

    await figma.clientStorage.setAsync("selection", all)
}

function pruneDups(incoming: LabelData[], stored: LabelData[]) {
    let result: LabelData[] = incoming
    let filtered = incoming.filter((item) => stored.some((i) => i.id === item.id))
    console.log("fitlered: ", filtered)
    if (filtered.length > 0) {
        result = incoming.filter((item) => filtered.some((i) => i.id === item.id) == false)
    }
    return result
}

function updateStored(incoming: LabelData[], stored: LabelData[]) {
    let result = stored
    result.map((item) => {
        let any = hasAny(item.id, incoming)
        if (any === true) {
            let update = incoming.filter((i) => i.id === item.id)[0]
            if ((item.label === '' && update.label !== '') || (item.label !== '' && update.label !== '')) {
                item.label = update.label
            }
        }
    })
    return result
}

function hasAny(id, list) {
    let result = false
    for (let i = 0; i < list.length; i++) {
        if (result === false) {
            result = list[i].id === id
        }
    }
    return result;
}

function containsItem(array, item) {
    let result = false
    array.forEach((storedItem) => {
        if (storedItem.id === item.id) {
            result = true
        }
    })
    return result
}

function removeMatches(ids, list) {
    let result = list
    debugger
    for (let j = 0; j < ids.length; j++) {
        result.splice(j, 1)
    }
    return result
}

function getMatches(id, list) {
    let init = []
    let res = []
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            init.push(i)
        }
    }
    res = [...new Set(init)]
    return res
}


function removeDuplicates(array) {
    let s = new Set(array)
    let res = s.values()
    return Array.from(res)
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
