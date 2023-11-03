'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function handleLabeling() {
    return __awaiter(this, void 0, void 0, function* () {
        figma.ui.postMessage({ type: "instruction", msg: "Select element(s) to label" });
        figma.on('selectionchange', () => __awaiter(this, void 0, void 0, function* () {
            const exportData = exportSelection();
            // const storageData = await extractForStorage()
            // console.log(storageData)
            // await figma.clientStorage.deleteAsync("selection")
            // await figma.clientStorage.setAsync("selection", storageData)
            // let fromStorage = await figma.clientStorage.getAsync("selection")
            // console.log("from storage: ", fromStorage)
            if (exportData.selection.length > 0) {
                figma.ui.postMessage(exportData);
            }
        }));
    });
}
function handleSaveAndLabel(data) {
    console.log(data);
}
function exportSelection() {
    const selection = figma.currentPage.selection;
    let names = [];
    selection.forEach((item) => {
        if (item.name !== undefined) {
            if (names === []) {
                names = [{ name: item.name, id: item.id, label: "" }];
            }
            else {
                names.push({ name: item.name, id: item.id, label: "" });
            }
        }
    });
    return { type: "selection", selection: names };
}

figma.showUI(__html__, { themeColors: true, width: 600, height: 408 });
figma.ui.onmessage = msg => {
    if (msg.activeTab === "labeling") {
        handleLabeling();
    }
    if (msg.type === "addLabels") {
        console.log(msg);
        handleSaveAndLabel(msg.data);
    }
};
