const path = require('path');
const fs = require('fs');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const filesPath = path.join(__dirname, 'pdf');

const templatePath = path.join(__dirname, 'template.html');
const resultPath = path.join(__dirname, 'result');
const resultFilePath = path.join(resultPath, 'result.html');

const createIndex = async (templatePath) => {
  fs.writeFile(resultFilePath, '', (err) => {
    if (err) throw err;
  });

  const readStream = fs.createReadStream(templatePath, 'utf8');
  readStream.on('data', (data) => {
    fs.promises.appendFile(resultFilePath, data);
  });
}

const removeDist = async (path) => {
  await fs.promises.rm(path, {
    recursive: true
  }, (err) => {
    if (err) throw err;
  });
}

const readDir = async () => {

  const items = await fs.promises.readdir(filesPath, {
    withFileTypes: true
  });

  for await (let item of items) {
    await countPages(path.join(filesPath, item.name), item.name);
  }
};

const countPages = async (filePath, fileName) => {
  const pdf = pdfjsLib.getDocument(filePath);
  pdf.promise.then(function (doc) {
    const numPages = doc.numPages;
    console.log(fileName);
    console.log(numPages);
  });
}

const creatApp = async () => {
  await removeDist(resultFilePath);
  await createIndex(templatePath);
  await readDir();
}

creatApp();