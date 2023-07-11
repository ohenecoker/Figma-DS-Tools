figma.showUI(__html__);
figma.ui.resize(600, 400);

figma.ui.onmessage = (msg) => {
  let orientation: Orientation = Orientation.horizontal;
  if (msg.foo === "bar") {
    let variants: string[] = [];
    let coords: Object[] = [];
    figma.on("selectionchange", () => {
      figma.currentPage.selection.forEach((item) => {
        if (item.type === "COMPONENT_SET") {
          // item.layoutMode = "NONE";
          item.layoutWrap = "WRAP";
          item.paddingTop = 72;
          item.counterAxisSpacing = 48;
          console.log(item);
          orientation = getOrientation(item);
          item.children.forEach((child) => {
            if (child.type === "COMPONENT") {
              child.constraints = { horizontal: "CENTER", vertical: "CENTER" };
            }
            variants.push(child.name);
            coords.push({
              id: child.id,
              x: child.absoluteBoundingBox?.x,
              y: child.absoluteBoundingBox?.y,
            });
          });
          scaleParent(item, orientation);
          figma.ui.postMessage(variants);
        }
      });
    });
  } else if (msg.type === "applyLabel") {
    const padding = 8;
    let labels: TextNode[] = [];
    figma.currentPage.selection.forEach(async (item) => {
      if (item.type === "COMPONENT_SET") {
        const fontName = { family: "Inter", style: "Regular" };
        let cv = (x: any) => x / 255;
        const color: RGB = { r: cv(151), g: cv(71), b: cv(255) };
        let ids: string[] = [];
        // let frame = figma.createFrame();
        // frame.fills = [];
        // frame.name =
        //   item.name.toLowerCase().split(" ").join("_") + "_label_frame";
        // frame.resize(
        //   item.absoluteBoundingBox!.width,
        //   item.absoluteBoundingBox!.height
        // );
        // frame.x = item.absoluteBoundingBox!.x;
        // frame.y = item.absoluteBoundingBox!.y;
        figma.currentPage.selection = [];
        figma
          .loadFontAsync({ family: "Inter", style: "Regular" })
          .then(async (_) => {
            figma.loadFontAsync(fontName).then(async (_) => {
              for (var i = 0; i < item.children.length; i++) {
                let data = msg.data[i].new;
                if (data !== "") {
                  try {
                    await figma.loadFontAsync(fontName);
                  } catch (e) {
                    console.error(e);
                  }
                  let child = item.children[i];
                  // console.log(child);
                  // console.log({
                  //   x: child.absoluteBoundingBox!.x,
                  //   y: child.absoluteBoundingBox!.y,
                  // });
                  const label = figma.createText();
                  label.fontName = fontName;
                  // frame.clipsContent = false;
                  // frame.appendChild(label);
                  label.x = child.absoluteBoundingBox!.x;
                  label.y =
                    child.absoluteBoundingBox!.y -
                    label.absoluteBoundingBox!.height -
                    padding;
                  label.characters = data;
                  if (data != "") {
                    label.name = `label_${data
                      .toLowerCase()
                      .split(" ")
                      .join("_")}`;
                  } else {
                    label.name = "label";
                  }
                  label.setRangeFills(0, data.length, [
                    { type: "SOLID", color: color },
                  ]);
                  label.fontSize = 10;
                  ids.push(label.id);
                  console.log("label id: ", label.id);
                  labels.push(label);
                  figma.currentPage.selection =
                    figma.currentPage.selection.concat(label);
                }
              }
            });
          });
        // figma.group(labels, frame);
        setTimeout(() => {
          figma.group(figma.currentPage.selection, figma.currentPage).name =
            "label_group";
        }, 300);
      }
    });
    let allLabels = [];

    console.log("labels are: ", labels);
    // debugger;
    // if (labels.length > 0) {
    // }
  }
};

function scaleParent(item: ComponentSetNode, orientation: Orientation) {
  const padding = 48;
  switch (orientation) {
    case Orientation.horizontal:
      let tallest = getTallestChildHeight(item);
      const horizontalWidth = item.width + padding * 2;
      const horizontalHeight = tallest + padding * 2;
      if (
        item.height >= horizontalHeight == false &&
        item.width >= horizontalWidth == false
      ) {
        item.resize(horizontalWidth, horizontalHeight);
      }
      break;
    case Orientation.vertical:
      let widest: number = getWidestChildHeight(item);
      const verticalWidth = widest + padding * 2;
      const verticalHeight = item.height + padding * 2;
      if (
        item.width >= verticalWidth == false &&
        item.height >= verticalHeight == false
      ) {
        item.resize(verticalWidth, verticalHeight);
      }
  }
}

function getTallestChildHeight(item: ComponentSetNode) {
  let tallest = 0;
  item.children.forEach((child) => {
    if (child.height > tallest) {
      tallest = child.height;
    }
  });
  return tallest;
}

function getWidestChildHeight(item: ComponentSetNode) {
  let widest = 0;
  item.children.forEach((child) => {
    if (child.width > widest) {
      widest = child.width;
    }
  });
  return widest;
}

function getOrientation(item: ComponentSetNode) {
  if (item.width > item.height) {
    return Orientation.horizontal;
  } else {
    return Orientation.vertical;
  }
}

enum Orientation {
  vertical,
  horizontal,
}

// figma.ui.onmessage = msg => {
//     if (msg.type === 'label' || msg.type === 'exp') {
//         console.clear()

//         for (const node of figma.currentPage.selection) {
//             let cloned: any;
//             if (node.name.includes("Annotation Frame")) {
//                 console.log("is old")
//                 if (node.type === 'FRAME') {
//                     let comp = node.findOne((item) => item.type === 'COMPONENT_SET')
//                     console.log(comp)
//                     cloned = comp!.clone()
//                     let parent = comp!.parent as FrameNode
//                     let grandParent = comp!.parent!.parent as FrameNode
//                     if (node.layoutMode == 'NONE') {
//                         comp!.parent!.parent!.appendChild(cloned)
//                         cloned.x = parent.x
//                         cloned.y = parent.y
//                     } else if (node.layoutMode == 'HORIZONTAL' || node.layoutMode == 'VERTICAL') {
//                         comp!.parent!.parent!.parent!.appendChild(cloned)
//                         cloned.x = grandParent.x
//                         cloned.y = grandParent.y
//                     }
//                     node.remove()
//                 }
//             }

//             if (cloned != undefined) {
//                 labelComponentParts(cloned, msg)
//             } else {
//                 labelComponentParts(node, msg)
//             }

//         }

//     } else if (msg.type === 'parts') {
//         console.clear()
//         for (const node of figma.currentPage.selection) {
//             if ("children" in node) {
//                 const children = node.children as InstanceNode[]
//                 let number = 1;
//                 children.forEach((child) => {
//                     if (child.visible === true) {
//                         const position = setPosition(msg.orientation, child)
//                         const childSize: Size = {
//                             width: child.absoluteRenderBounds!.width,
//                             height: child.absoluteBoundingBox!.height
//                         }
//                         addPointers(position, childSize, number)
//                         number += 1
//                     }
//                 })
//             }
//         }
//     }

//     if (msg.type === 'font-style') {
//         console.log("font style")
//         console.log("weight: ", msg.weight)
//         console.log("font size: ", msg.size)
//         console.log("is italic: ", msg.isItalic)
//         console.log("line height: ", msg.lineHeight)
//         console.log("group: ", msg.group)
//         console.log("density: ", msg.density)
//         console.log("weight-name: ", msg.weightName)
//         console.log("style-name: ", msg.styleName)
//         console.log("size-name: ", msg.sizeName)

//         const lineHeight: LineHeight = {value: parseInt(msg.lineHeight), unit: 'PIXELS'}
//         const name = msg.isItalic == true ? `${msg.group} / ${msg.sizeName} / ${msg.density} / ${msg.weight} Italic`
//             : `${msg.group} / ${msg.sizeName} / ${msg.density} / ${msg.weight}`
//         let style = figma.createTextStyle()

//         // if (msg.weight === 'Regular' && msg.isItalic == true) {
//         //
//         //     figma.loadFontAsync(({family: "Rubik", style: "Italic"})).then((_) => {
//         //         const fontName: FontName = {family: "Rubik", style: "Italic"}
//         //         console.log(fontName)
//         //         style.fontName = fontName
//         //         style.lineHeight = lineHeight
//         //         style.fontSize = parseInt(msg.size)
//         //         style.name = `${msg.group} / ${msg.size} / ${msg.density} / ${msg.weight} / Italic`
//         //     })
//         // }

//         figma.loadFontAsync(({family: "Rubik", style: "Regular"})).then((_) => {
//             figma.loadFontAsync(({family: "Rubik", style: "Italic"})).then((_) => {
//                 figma.loadFontAsync(({family: "Rubik", style: "Medium"})).then((_) => {
//                     figma.loadFontAsync(({family: "Rubik", style: "Medium Italic"})).then((_) => {
//                         let fontVariation = ''
//                         // msg.isItalic ? `${msg.weight} Italic` : msg.weight
//                         if (msg.weight === 'Regular' && msg.isItalic == true) {
//                             fontVariation = "Italic"
//                         } else if (msg.weight === 'Regular' && msg.isItalic == false) {
//                             fontVariation = "Regular"
//                         } else if (msg.weight === 'Medium' && msg.isItalic == false) {
//                             fontVariation = "Medium"
//                         } else if (msg.weight === 'Medium' && msg.isItalic == true) {
//                             fontVariation = "Medium Italic"
//                         }
//                         const fontName: FontName = {family: "Rubik", style: fontVariation}
//                         console.log(fontName)
//                         style.fontName = fontName
//                         style.lineHeight = lineHeight
//                         style.fontSize = parseInt(msg.size)
//                         style.name = name
//                     })
//                 })
//             })
//         })
//         // style.lineHeight =
//     }

// };

// function labelComponentParts(node: any, msg: any) {
//     let allVariantLabelsFrame = figma.createFrame()
//     let mainComponentLabelFrame = figma.createFrame()
//     mainComponentLabelFrame.name = 'Component Label Annotation'
//     mainComponentLabelFrame.itemSpacing = 32
//     mainComponentLabelFrame.layoutMode = msg.orientation === 'horizontal' ? 'VERTICAL' : 'HORIZONTAL'
//     mainComponentLabelFrame.counterAxisAlignItems = 'MIN'
//     mainComponentLabelFrame.layoutAlign = 'STRETCH'
//     mainComponentLabelFrame.counterAxisSizingMode = 'AUTO'
//     allVariantLabelsFrame.layoutMode = msg.orientation === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL'
//     allVariantLabelsFrame.counterAxisAlignItems = 'MAX'
//     allVariantLabelsFrame.counterAxisSizingMode = 'AUTO'
//     let gap = 48
//     const originalPosition: Position = {
//         x: node.x,
//         y: node.y,
//         direction: msg.orientation === 'horizontal' ? 'Left' : 'Up'
//     }
//     if (msg.type === 'exp' && msg.orientation === 'horizontal') {
//         gap = 120
//     }
//     const parent = node.parent
//     let parentX = node.x
//     let parentY = msg.orientation == 'horizontal' && node.type === 'COMPONENT_SET' ? node.y - (gap * 2) : node.y - gap
//     const fontName: FontName = {family: "Rubik", style: "Bold"}
//     let frame = figma.createFrame()
//     frame.layoutMode = msg.orientation == 'horizontal' ? 'HORIZONTAL' : 'VERTICAL'
//     frame.counterAxisSizingMode = 'AUTO'
//     frame.primaryAxisSizingMode = 'AUTO'
//     frame.itemReverseZIndex = false
//     frame.itemSpacing = 32
//     let fills: Paint[] = []
//     frame.fills = fills
//     if (msg.type === 'exp') {
//         parent!.appendChild(frame)
//         frame.name = `Annotation Frame: ${node.name}`
//         mainComponentLabelFrame.appendChild(node)
//         frame.appendChild(mainComponentLabelFrame)
//         node.y = frame.y + (frame.height - node.height)
//         node.x = frame.x
//         parentY = frame.y
//         parentX = frame.x
//     }
//     let topLabel = addLabel(
//         node.name,
//         parentX,
//         parentY,
//         fontName,
//         parent as FrameNode,
//         true,
//         frame,
//         msg.orientation,
//         undefined,
//         mainComponentLabelFrame,
//         node,
//     )
//     let longest = 0
//     let variantLabel: TextNode = figma.createText();
//     if (node.type === 'COMPONENT_SET') {
//         figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
//             figma.loadFontAsync({family: "Rubik", style: "Regular"}).then(async (_) => {
//                 longest = await getLongestTextLength(node, fontName).then(async value => {
//                     return value
//                 })
//                 for (const item of node.children) {
//                     let name = ""
//                     let length: number = 0
//                     item.name.split(",").map((thing: any) =>
//                         name = createVariantText(thing, name)
//                     )
//                     name = name.split("/").reverse().join(" / ")
//                     if (name.includes('Enabled / Disabled')) {
//                         name = "Disabled"
//                     } else if (name.includes('Enabled / Enabled ')) {
//                         name = "Enabled"
//                     }
//                     const fontName: FontName = {family: "Rubik", style: "Regular"}

//                     length = await getTextLength(item, fontName).then(async value => {
//                         return value
//                     })

//                     let x = msg.orientation === 'horizontal' ? node.x + (item.x) : node.x + (node.width - length) - (node.width) - gap
//                     const y = msg.orientation === 'horizontal' ? node.y - (gap / 2) : node.y + item.y
//                     variantLabel = addLabel(
//                         name,
//                         x,
//                         y,
//                         fontName,
//                         node.parent as FrameNode,
//                         false,
//                         undefined,
//                         msg.orientation,
//                         allVariantLabelsFrame,
//                         mainComponentLabelFrame,
//                         item
//                     )
//                 }
//             })
//         })

//     }
//     if (msg.orientation === 'horizontal') {
//         frame.x = originalPosition.x
//         frame.y = originalPosition.y - (frame.height / 2)
//     } else {
//         frame.x = originalPosition.x - ((frame.width + gap + longest) / 2)
//         frame.y = originalPosition.y
//     }
// }

// function putLabelsInFrame() {
//     let results = figma.currentPage.findAll(item => item.name.includes("Annotation"))
//     console.log(results)
// }

// function createVariantText(variantProp: string, name: string) {
//     let propValue = variantProp.split("=")[1];
//     let propKey = variantProp.split("=")[0];
//     if (propValue.includes("Disabled") == false) {
//         console.log(propKey)
//         if (propValue == 'True') {
//             propValue = propKey
//         } else if (propValue == 'False') {
//             propValue = `Enabled`
//         }
//     }
//     if (name === "") {
//         name = propValue
//     } else {
//         if (propValue.includes("Disabled")) {
//             name = propValue
//         } else {
//             name = `${name} / ${propValue}`
//         }
//     }
//     return name
// }

// function setPosition(orientation: string, child: InstanceNode) {
//     let position: Position = {
//         x: 0,
//         y: 0,
//         direction: 'Up'
//     }
//     switch (orientation) {
//         case 'horizontal':
//             position = {
//                 x: child.absoluteRenderBounds!.x,
//                 y: child.absoluteBoundingBox!.y + child.absoluteBoundingBox!.height + 2,
//                 direction: 'Up'
//             }
//             break
//         case 'vertical':
//             position = {
//                 x: child.absoluteBoundingBox!.x,
//                 y: child.absoluteBoundingBox!.y,
//                 direction: 'Right'
//             }
//             break
//     }
//     return position;
// }

// interface Size {
//     width: number,
//     height: number,
// }

// interface Position {
//     x: number,
//     y: number,
//     direction: Direction
// }

// figma.ui.postMessage("DS Tools")

// declare type Direction = 'Up' | 'Down' | 'Left' | 'Right'

// function addPointers(position: Position, size: Size, number: number = 0) {
//     const main = figma.root.findOne(n => n.name === "Figure Number")

//     if (main != undefined) {
//         if ("children" in main) {
//             const parent = main.children.filter(n => n.name === "Figure Number")[0]
//             if ("children" in parent) {
//                 const children = parent.children as SceneNode[]
//                 let component = children.filter(n => n.name === `Orientation=${position.direction}`)[0] as ComponentNode
//                 let numberComponent = component.children[1]
//                 if ("mainComponent" in numberComponent) {
//                     component.resize(component.width, 48)
//                     let instance = component.createInstance()
//                     instance.x = position.x
//                     instance.y = position.y
//                     let subs = instance.children
//                     let num = subs.slice(0)[0] as InstanceNode
//                     switch (position.direction) {
//                         case 'Up':
//                             num = subs.slice(1)[0] as InstanceNode
//                             num.setProperties({"Number#1:0": number.toString()})
//                             break
//                         case 'Right':
//                             num = subs.slice(0)[0] as InstanceNode
//                             num.resize(10, 10)
//                             num.setProperties({"Number#1:0": number.toString()})
//                     }

//                 }
//             }
//         }
//     }
// }

// function addLabel(name: string,
//                   x: number,
//                   y: number,
//                   fontName: FontName,
//                   parentFrame?: SceneNode,
//                   wrapInFrame: boolean = false,
//                   frameNode?: FrameNode,
//                   orientation?: string,
//                   innerLabelWrapper?: FrameNode,
//                   mainComponentLabelFrame?: FrameNode,
//                   subjectFrame?: SceneNode,
//                   variantsComponentsWrapper?: FrameNode,
// ) {
//     let text = figma.createText()
//     figma.loadFontAsync({family: "Inter", style: "Regular"}).then((_) => {
//         figma.loadFontAsync(fontName).then((_) => {
//             let cv = (x: any) => x / 255
//             const color: RGB = {r: cv(151), g: cv(71), b: cv(255)}
//             text.name = `Annotation Label: ${name}`
//             text.y = y
//             text.x = x ??= 0
//             // text.layoutAlign = 'STRETCH'
//             if (innerLabelWrapper != undefined) {
//                 text.textAutoResize = 'WIDTH_AND_HEIGHT'
//                 // Variant labels
//                 if (parentFrame != undefined && parentFrame.type == 'FRAME') {
//                     innerLabelWrapper.primaryAxisSizingMode = 'AUTO'
//                     mainComponentLabelFrame!.insertChild(0, innerLabelWrapper)
//                     let compParent = subjectFrame!.parent as ComponentSetNode
//                     let newLine: LineHeight = {value: subjectFrame!.height, unit: 'PIXELS'}
//                     innerLabelWrapper.itemSpacing = compParent.itemSpacing
//                     text.lineHeight = newLine
//                 }
//                 innerLabelWrapper.appendChild(text)

//             } else if (mainComponentLabelFrame != null) {
//                 let labelFrame = figma.createFrame()
//                 labelFrame.layoutMode = 'VERTICAL'
//                 labelFrame.layoutAlign = 'STRETCH'
//                 labelFrame.counterAxisAlignItems = 'MAX'
//                 // Main label
//                 if (parentFrame != undefined && parentFrame.type == 'FRAME') {
//                     labelFrame.appendChild(text)
//                     if (frameNode != undefined && frameNode.type == 'FRAME') {
//                         frameNode.insertChild(0, labelFrame)
//                     }
//                 }
//             } else {
//                 figma.currentPage.appendChild(text)
//             }
//             text.insertCharacters(0, name, 'BEFORE')
//             text.setRangeFontName(0, name.length, fontName)
//             text.setRangeFills(0, name.length, [{type: 'SOLID', color: color}])
//             text.textAlignHorizontal = "RIGHT"
//         })
//     })
//     return text
// }

// async function getLongestTextLength(node: ComponentSetNode, fontName: FontName) {
//     let longest = 0
//     node.children.forEach(item => {
//         let name = ""
//         item.name.split(",").map(thing => {
//             name = createVariantText(thing, name)
//             // console.log(name)
//         })
//         let text = figma.createText()
//         text.insertCharacters(0, name, 'BEFORE')
//         text.setRangeFontName(0, name.length, fontName)
//         if (longest < text.width) {
//             longest = text.width
//         }
//         text.remove()
//     })
//     return longest;
// }

// async function getTextLength(node: SceneNode, fontName: FontName) {
//     let name = ""
//     let width: number
//     node.name.split(",").map(thing => {
//         if (name === "") {
//             name = thing.split("=")[1]
//         } else {
//             name = `${name} / ${thing.split("=")[1]}`
//         }
//     })
//     let text = figma.createText()
//     text.insertCharacters(0, name, 'BEFORE')
//     text.setRangeFontName(0, name.length, fontName)
//     width = text.width;
//     text.remove()
//     return width
// }
