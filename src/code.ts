import {handleLabeling} from "./labeling";

figma.showUI(__html__, {themeColors: true, width: 600, height: 408});

figma.ui.onmessage = msg => {
    if (msg.activeTab === "labeling") {
        handleLabeling()
    }
};
