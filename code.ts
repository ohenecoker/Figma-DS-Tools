figma.showUI(__html__);
figma.ui.resize(400, 300)
figma.ui.onmessage = msg => {
  if (msg.type === 'label') {
    for (const node of figma.currentPage.selection) {
      const parentX = node.absoluteBoundingBox!.x
      const parentY = msg.orientation == 'horizontal' && node.type === 'COMPONENT_SET' ? node.absoluteBoundingBox!.y - (48 * 2) : node.absoluteBoundingBox!.y - 48
      const fontName: FontName = { family: "Rubik", style: "Bold" }
      addLabel(node.name, parentX, parentY, fontName)
      if (node.type === 'COMPONENT_SET') {
        node.children.forEach((item) => {
          let x = msg.orientation === 'horizontal' ? item.absoluteBoundingBox!.x + node.width : node.x
          const y = msg.orientation === 'horizontal' ? node.absoluteBoundingBox!.y - 48 : item.absoluteBoundingBox!.y
          if (x != undefined) { x = x - node.width }
          const name = item.name.split("=")[1]
          const fontName: FontName = { family: "Rubik", style: "Regular" }
          addLabel(name, x, y, fontName)
        })
      }
    }

  }
  else if (msg.type === 'parts') {
    console.log("label parts")
    for (const node of figma.currentPage.selection) {
      if ("children" in node) {
        const children = node.children as InstanceNode[]
        children.forEach((child) => {
          if (child.visible === true) {
            console.log(child.name)
            addPointers(child.absoluteRenderBounds!.x, node.y + node.height, 'Up')
          }
        })
      }
    }
  }
};
figma.ui.postMessage("Hello world")

declare type Direction = 'Up' | 'Down' | 'Left' | 'Right'

function addPointers(x: number = 0, y: number = 0, direction: Direction = 'Up') {
  const main = figma.root.findOne(n => n.name === "Figure Number")

  if (main != undefined) {
    if ("children" in main) {
      const parent = main.children.filter(n => n.name === "Figure Number")[0]

      if ("children" in parent) {
        const children = parent.children as SceneNode[]
        let component = children.filter(n => n.name === `Orientation=${direction}`)[0] as ComponentNode
        component.resize(component.width, 48)
        let instance = component.createInstance()
        instance.x = x
        instance.y = y
      }
    }
  }
}


function addLabel(name: string, x: number, y: number, fontName: FontName) {
  figma.loadFontAsync({ family: "Inter", style: "Regular" }).then((_) => {
    figma.loadFontAsync(fontName).then((_) => {
      let cv = (x: any) => x / 255
      const color: RGB = { r: cv(151), g: cv(71), b: cv(255) }
      let text = figma.createText()
      text.y = y
      text.x = x ??= 0
      text.insertCharacters(0, name, 'BEFORE')
      text.setRangeFontName(0, name.length, fontName)
      text.setRangeFills(0, name.length, [{ type: 'SOLID', color: color }])
      figma.currentPage.appendChild(text)
    })
  })
}
