import * as fs from "fs";

const HTML_EXTENSION = '.html';
const JS_EXTENSION = '.js';

const PATH = './dist';

const files = fs.readdirSync(PATH)

const html = files.filter((file) => file.endsWith(HTML_EXTENSION))[0]

const APP_FILE_NAME = "app.js"


function getContent(fileName, path) {
    const data = fs.readFileSync(`${path}/${fileName}`, 'utf8')
    return data;
}

let content = getContent(html, PATH)

// log everything in the script tag
const script = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gm)[0]
let old = script
content = content.replace(script, "")

// console.log(content)

// console.log(old)

const bottom = content.match(/<\/html>/gm)[0]
content = content.replace(bottom, old)

fs.writeFile(`${PATH}/${html}`, content, function (err) {
    if (err) return console.log(err);
    console.log(`${html} updated`);
});

