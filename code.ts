figma.showUI(__html__);
figma.ui.resize(400, 300)


figma.ui.onmessage = msg => {
    if (msg.type === 'label' || msg.type === 'exp') {
        for (const node of figma.currentPage.selection) {
            let gap = 48
            const originalPosition: Position = {
                x: node.x,
                y: node.y,
                direction: msg.orientation === 'horizontal' ? 'Left' : 'Up'
            }
            if (msg.type === 'exp' && msg.orientation === 'horizontal') {
                gap = 120
            }
            const parent = node.parent
            let parentX = node.x
            let parentY = msg.orientation == 'horizontal' && node.type === 'COMPONENT_SET' ? node.y - (gap * 2) : node.y - gap
            const fontName: FontName = {family: "Rubik", style: "Bold"}
            let frame = figma.createFrame()
            let fills: Paint[] = []
            frame.fills = fills
            if (msg.type === 'exp') {
                parent!.appendChild(frame)
                frame.name = `Annotation Frame: ${node.name}`
                frame.appendChild(node)
                if (msg.orientation === 'horizontal') {
                    frame.resize(node.width, node.height + gap)
                } else {
                    frame.resize(node.width, node.height + gap)
                }
                frame.clipsContent = false
                node.y = frame.y + (frame.height - node.height)
                node.x = frame.x
                parentY = frame.y
                parentX = frame.x
            }
            let topLabel = addLabel(node.name, parentX, parentY, fontName, parent as FrameNode, true, frame)
            let longest = 0
            if (node.type === 'COMPONENT_SET') {

                figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
                    figma.loadFontAsync({family: "Rubik", style: "Regular"}).then(async (_) => {
                        longest = await getLongestTextLength(node, fontName).then(async value => {
                            return value
                        })
                        if (msg.orientation === 'vertical' && msg.type === 'exp') {
                            frame.resize(node.width + longest + gap, node.height + gap)
                            node.x = frame.width - node.width
                            topLabel.x = node.x
                        }
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
                            let x = msg.orientation === 'horizontal' ? node.x + (item.x) : node.x + (node.width - length) - (node.width) - gap
                            const y = msg.orientation === 'horizontal' ? node.y - (gap / 2) : node.y + item.y
                            addLabel(name, x, y, fontName, node.parent as FrameNode)
                        }
                    })
                })
            }
            if (msg.orientation === 'horizontal') {
                frame.x = originalPosition.x
                frame.y = originalPosition.y - (frame.height / 2)
            } else {
                frame.x = originalPosition.x - ((frame.width + gap + longest) / 2)
                frame.y = originalPosition.y
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


function addLabel(name: string,
                  x: number,
                  y: number,
                  fontName: FontName,
                  parentFrame?: SceneNode,
                  wrapInFrame: boolean = false,
                  frameNode?: FrameNode
) {
    let text = figma.createText()
    figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
        figma.loadFontAsync(fontName).then((_) => {
            let cv = (x: any) => x / 255
            const color: RGB = {r: cv(151), g: cv(71), b: cv(255)}
            text.name = "Annotation Label"
            text.y = y
            text.x = x ??= 0
            // let frame =
            if (wrapInFrame == true) {
                frameNode!.appendChild(text)
            } else if (parentFrame != undefined) {
                if (parentFrame.type == 'FRAME') {
                    parentFrame.appendChild(text)
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
    return text
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
