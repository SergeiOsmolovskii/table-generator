const path = require('path');
const fs = require('fs');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const filesPath = path.join(__dirname, 'pdf');

const templatePath = path.join(__dirname, 'template.html');
const resultPath = path.join(__dirname, 'result');
const resultFilePath = path.join(resultPath, 'result.html');

let table = '';

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
  let index = 1;
  const items = await fs.promises.readdir(filesPath, {
    withFileTypes: true
  });

  for await (let item of items) {
    await countPages(path.join(filesPath, item.name), item.name, index).then(async () => {
      await appendNewTable();
      index++;
    });
  }
};

const countPages = async (filePath, fileName, i) => {
  const pdf = pdfjsLib.getDocument(filePath);
  pdf.promise.then(function (doc) {
    const numPages = doc.numPages;
    table += `
      <tr>
          <td>${i}</td>
          <td>${fileName}</td>
          <td>${numPages}</td>
      </tr>
    `
    console.log(fileName);
    console.log(numPages);
  })

}
const appendNewTable = async () => {
  const templateFile = fs.promises.readFile(templatePath, 'utf8');
  let templateFileData = await templateFile;
  templateFileData = templateFileData.replace('{{main}}', table);
  fs.writeFile(resultFilePath, templateFileData, (err) => {
    if (err) throw err;
});
}

const creatApp = async () => {
  await removeDist(resultFilePath);
  await createIndex(templatePath);
  await readDir();
}

creatApp();