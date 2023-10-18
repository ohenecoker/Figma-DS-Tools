export function runApp() {

    let tabs = Array.from(document.querySelectorAll(":is(.toolbar) button"))
    let picker = document.querySelector("#csv")
    let apply = document.querySelector('#apply')
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => {
                if (item.classList.contains("active-tab")) {
                    item.classList = ["inactive-tab"]
                }
            })
            tab.classList.add("active-tab")
            if (tab.innerText == "Labeling") {
                let labeling = document.getElementById("labeling")
                let annotation = document.getElementById("annotation")
                let library = document.getElementById("library")
                let data = document.getElementById("data")
                labeling.classList = ["tab"]
                annotation.classList = ["tab tab-hidden"]
                data.classList = ["tab tab-hidden"]
                library.classList = ["tab tab-hidden"]
            } else if (tab.innerText == "Annotation") {
                let labeling = document.getElementById("labeling")
                let annotation = document.getElementById("annotation")
                let library = document.getElementById("library")
                let data = document.getElementById("data")
                labeling.classList = ["tab tab-hidden"]
                library.classList = ["tab tab-hidden"]
                data.classList = ["tab tab-hidden"]
                annotation.classList = ["tab"]
            } else if (tab.innerText == "Data") {
                let labeling = document.getElementById("labeling")
                let annotation = document.getElementById("annotation")
                let library = document.getElementById("library")
                let data = document.getElementById("data")
                labeling.classList = ["tab tab-hidden"]
                annotation.classList = ["tab tab-hidden"]
                library.classList = ["tab tab-hidden"]
                data.classList = ["tab"]
            } else {
                let labeling = document.getElementById("labeling")
                let annotation = document.getElementById("annotation")
                let library = document.getElementById("library")
                labeling.classList = ["tab tab-hidden"]
                let data = document.getElementById("data")
                data.classList = ["tab tab-hidden"]
                annotation.classList = ["tab tab-hidden"]
                library.classList = ["tab"]
            }
        })
    })

    parent.postMessage({pluginMessage: {foo: "bar"}}, "*")


// csv.addEventListener("change", (e) => CSVToArray(e.target.files[0]))
    csv.addEventListener("change", (e) => CSVToArray(e.target.files[0]))

    async function CSVToArray(strData, strDelimiter) {
        console.clear()
        var data = await strData.text()
        const rows = data.split('\n').slice(1)
        const headerRow = rows[0]
        // console.log(data)
        // console.log(rows)
        // console.log(headerRow)
        const colCount = headerRow.split(",").length
        console.log(`col count: ${colCount}`)
        let rowOne  = getCol(1, rows)
        let rowTwo  = getCol(2, rows)
        console.log(rowOne)
        console.log(rowTwo)
    }


    function getCol(num, rows) {
        let results = []
        for(let i = 0; i < rows.length; i++) {
            const row = rows[i]
            let cols = row.split(',')
            results.push(cols[num - 1])
        }
        return results
    }

    onmessage = (event) => {
        let hint = document.querySelector('.hint')
        let title = document.querySelector('#title')
        let footer = document.querySelector('footer')
        let table = document.querySelector('table')
        hint.classList.add('hide')
        apply.classList.remove('hide')
        footer.classList.remove('hide')
        table.classList.remove('hide')
        title.classList.remove('hide')
        let variants = []
        console.log(event.data.pluginMessage)

        Array.from(table.children).forEach((item) => {
            if (item.classList.contains("header-row") == false) {
                item.remove()
            }
        })
        if (typeof event.data.pluginMessage === "string") {
            const message = event.data.pluginMessage
            displayMessage(message)
        }


        for (let i = 0; i < event.data.pluginMessage.length; i++) {
            if (variants.includes(event.data.pluginMessage[i]) == false) {
                variants.push(event.data.pluginMessage[i])
            }
        }

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i]
            let row = document.createElement('tr')
            let variantCell = document.createElement('td')
            variantCell.classList.add('rename-input')
            let inputCell = document.createElement('td')
            let input = document.createElement('input')
            let allCells = Array.from(document.querySelectorAll('td'))
            input.setAttribute("type", "text")
            inputCell.appendChild(input)
            let isPresent = false;
            variantCell.innerText = variant
            row.appendChild(variantCell)
            row.appendChild(inputCell)
            table.appendChild(row)
        }
    }

    let labels = []
    apply.addEventListener('click', () => {
        let inputs = Array.from(document.querySelectorAll('input'))
        let originals = Array.from(document.querySelectorAll('.rename-input'))
        for (let i = 0; i < inputs.length; i++) {
            labels.push({
                old: originals[i].innerText,
                new: inputs[i].value
            })
        }
        // console.log(labels)

        parent.postMessage({pluginMessage: {type: "applyLabel", data: labels}}, "*")
    })

    function displayMessage(message) {
        let par = document.querySelector(".info > p")
        par.innerHTML = message
    }
}