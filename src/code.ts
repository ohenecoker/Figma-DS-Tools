import {handleLabeling, handleSaveAndLabel} from "./labeling";

figma.showUI(__html__, {themeColors: true, width: 600, height: 408});

figma.ui.onmessage = async msg => {
    if (msg.activeTab === "labeling") {
        handleLabeling()
    }
    if (msg.type === "addLabels") {
        console.log(msg)
        await handleSaveAndLabel(msg.data)
    }
};
