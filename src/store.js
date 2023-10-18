import {atom} from 'nanostores';

export const tabOpened = atom("labeling");
function setData() {
    tabOpened.set("data");
}
tabOpened.subscribe(tab => {
    if(tabOpened === "data") {
        document.getElementById("data-btn").setAttribute("class", "active-tab");
    }
})
