figma.showUI(__html__);
figma.ui.resize(400, 300)


figma.ui.onmessage = msg => {
    if (msg.type === 'label') {
        for (const node of figma.currentPage.selection) {
            const parentX = node.x
            const parentY = msg.orientation == 'horizontal' && node.type === 'COMPONENT_SET' ? node.absoluteBoundingBox!.y - (48 * 2) : node.y - 48
            const fontName: FontName = {family: "Rubik", style: "Bold"}
            addLabel(node.name, parentX, parentY, fontName, node.parent as FrameNode)
            if (node.type === 'COMPONENT_SET') {
                let longest = 0
                const gap = 48

                figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
                    figma.loadFontAsync({family: "Rubik", style: "Regular"}).then(async (_) => {
                        longest = await getLongestTextLength(node, fontName).then(async value => {
                            return value
                        })
                        console.log("longest: ", longest)
                        for (const item of node.children) {
                            let name = ""
                            let length: number = 0
                            item.name.split(",").map(thing => {
                                if (name === "") {
                                    name = thing.split("=")[1]
                                } else {
                                    name = `${name} / ${thing.split("=")[1]}`
                                }
                            })
                            name = name.split("/").reverse().join(" / ")
                            const fontName: FontName = {family: "Rubik", style: "Regular"}

                            length = await getTextLength(item, fontName).then(async value => {
                                return value
                            })
                            console.log("length: ", length)

                            console.log(node.parent)
                            let x = msg.orientation === 'horizontal' ? item.absoluteBoundingBox!.x + node.width : /*(node.width - length)*/node.x + (node.width - length) - (node.width) - gap
                            const y = msg.orientation === 'horizontal' ? node.absoluteBoundingBox!.y - 48 : node.y + item.y
                            addLabel(name, x, y, fontName, node.parent as FrameNode)
                        }
                    })
                })
            }
        }

    } else if (msg.type === 'parts') {
        console.clear()
        for (const node of figma.currentPage.selection) {
            if ("children" in node) {
                const children = node.children as InstanceNode[]
                let number = 1;
                children.forEach((child) => {
                    if (child.visible === true) {
                        const position = setPosition(msg.orientation, child)
                        const childSize: Size = {
                            width: child.absoluteRenderBounds!.width,
                            height: child.absoluteBoundingBox!.height
                        }
                        console.log(position)
                        console.log(msg.orientation)
                        addPointers(position, childSize, number)
                        number += 1
                    }
                })
            }
        }
    }
};

function setPosition(orientation: string, child: InstanceNode) {
    let position: Position = {
        x: 0,
        y: 0,
        direction: 'Up'
    }
    switch (orientation) {
        case 'horizontal':
            position = {
                x: child.absoluteRenderBounds!.x,
                y: child.absoluteBoundingBox!.y + child.absoluteBoundingBox!.height + 2,
                direction: 'Up'
            }
            break
        case 'vertical':
            position = {
                x: child.absoluteBoundingBox!.x,
                y: child.absoluteBoundingBox!.y,
                direction: 'Right'
            }
            break
    }
    return position;
}

interface Size {
    width: number,
    height: number,
}

interface Position {
    x: number,
    y: number,
    direction: Direction
}

figma.ui.postMessage("Hello world")

declare type Direction = 'Up' | 'Down' | 'Left' | 'Right'

function addPointers(position: Position, size: Size, number: number = 0) {
    const main = figma.root.findOne(n => n.name === "Figure Number")

    if (main != undefined) {
        if ("children" in main) {
            const parent = main.children.filter(n => n.name === "Figure Number")[0]
            if ("children" in parent) {
                const children = parent.children as SceneNode[]
                let component = children.filter(n => n.name === `Orientation=${position.direction}`)[0] as ComponentNode
                let numberComponent = component.children[1]
                if ("mainComponent" in numberComponent) {
                    component.resize(component.width, 48)
                    let instance = component.createInstance()
                    instance.x = position.x
                    instance.y = position.y
                    let subs = instance.children
                    let num = subs.slice(0)[0] as InstanceNode
                    switch (position.direction) {
                        case 'Up':
                            num = subs.slice(1)[0] as InstanceNode
                            num.setProperties({"Number#1:0": number.toString()})
                            break
                        case 'Right':
                            num = subs.slice(0)[0] as InstanceNode
                            num.resize(10, 10)
                            num.setProperties({"Number#1:0": number.toString()})
                    }


                }
            }
        }
    }
}


function addLabel(name: string, x: number, y: number, fontName: FontName, parent?: SceneNode) {
    figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
        figma.loadFontAsync(fontName).then((_) => {
            let cv = (x: any) => x / 255
            const color: RGB = {r: cv(151), g: cv(71), b: cv(255)}
            let text = figma.createText()
            text.name = "Annotation Label"
            text.y = y
            text.x = x ??= 0
            if (parent != undefined) {
                if (parent.type == 'FRAME') {
                    parent.appendChild(text)
                }
            } else {
                figma.currentPage.appendChild(text)
            }
            text.insertCharacters(0, name, 'BEFORE')
            text.setRangeFontName(0, name.length, fontName)
            text.setRangeFills(0, name.length, [{type: 'SOLID', color: color}])
            text.textAlignHorizontal = "RIGHT"
        })
    })
}

async function getLongestTextLength(node: ComponentSetNode, fontName: FontName) {
    let longest = 0
    node.children.forEach(item => {
        let name = ""
        item.name.split(",").map(thing => {
            if (name === "") {
                name = thing.split("=")[1]
            } else {
                name = `${name} / ${thing.split("=")[1]}`
            }
        })
        let text = figma.createText()
        text.insertCharacters(0, name, 'BEFORE')
        text.setRangeFontName(0, name.length, fontName)
        if (longest < text.width) {
            console.log("text width: ", text.width)
            longest = text.width
        }
        text.remove()
    })
    return longest;
}

async function getTextLength(node: SceneNode, fontName: FontName) {
    let name = ""
    let width: number
    node.name.split(",").map(thing => {
        if (name === "") {
            name = thing.split("=")[1]
        } else {
            name = `${name} / ${thing.split("=")[1]}`
        }
    })
    let text = figma.createText()
    text.insertCharacters(0, name, 'BEFORE')
    text.setRangeFontName(0, name.length, fontName)
    width = text.width;
    text.remove()
    return width
}
