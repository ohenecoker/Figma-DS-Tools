figma.showUI(__html__);
figma.ui.resize(400, 300)
figma.ui.onmessage = msg => {
    if (msg.type === 'label') {
        for (const node of figma.currentPage.selection) {
            const parentX = node.absoluteBoundingBox!.x
            const parentY = msg.orientation == 'horizontal' && node.type === 'COMPONENT_SET' ? node.absoluteBoundingBox!.y - (48 * 2) : node.absoluteBoundingBox!.y - 48
            const fontName: FontName = {family: "Rubik", style: "Bold"}
            addLabel(node.name, parentX, parentY, fontName)
            if (node.type === 'COMPONENT_SET') {
                let longest = 0
                const gap = 48
                node.children.forEach(item => {
                    if (item.width > longest) {
                        longest = item.absoluteBoundingBox!.width
                    }
                })
                node.children.forEach((item) => {
                    let x = msg.orientation === 'horizontal' ? item.absoluteBoundingBox!.x + node.width : item.absoluteBoundingBox!.x + (node.width - (longest / 2) + gap)
                    const y = msg.orientation === 'horizontal' ? node.absoluteBoundingBox!.y - 48 : item.absoluteBoundingBox!.y
                    if (x != undefined) {
                        x = x - node.width
                    }
                    const name = item.name.split("=")[1]
                    const fontName: FontName = {family: "Rubik", style: "Regular"}
                    addLabel(name, x, y, fontName)
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


function addLabel(name: string, x: number, y: number, fontName: FontName) {
    figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
        figma.loadFontAsync(fontName).then((_) => {
            let cv = (x: any) => x / 255
            const color: RGB = {r: cv(151), g: cv(71), b: cv(255)}
            let text = figma.createText()
            text.y = y
            text.x = x ??= 0
            text.insertCharacters(0, name, 'BEFORE')
            text.setRangeFontName(0, name.length, fontName)
            text.setRangeFills(0, name.length, [{type: 'SOLID', color: color}])
            figma.currentPage.appendChild(text)
        })
    })
}
