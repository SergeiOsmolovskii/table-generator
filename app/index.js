const path = require('path');
const fs = require('fs');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const filesPath = path.join(__dirname, 'pdf');

const templatePath = path.join(__dirname, 'template.html');
const resultPath = path.join(__dirname, 'result');
const resultFilePath = path.join(resultPath, 'result.html');
const resultDocxFilePath = path.join(resultPath, 'result.docx');

const HTMLtoDOCX = require('html-to-docx');

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

  for (let item of items) {
    await countPages(path.join(filesPath, item.name), item.name, index).then(async () => {
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
          <td>${fileName.slice(0, -4)}</td>
          <td>${numPages}</td>
      </tr>
    `;
  }).then(async () => {
    await appendNewTable();
  })
  return table;
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
  setTimeout( async () => {
    const file = fs.promises.readFile(resultFilePath, 'utf8');
    let resultFile = await file;
    let footer = `
      <table>
        <tbody>
      
        </tbody>
      </table>
    `;
      (async () => {
    const fileBuffer = await HTMLtoDOCX(resultFile, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      header: true,
      pageNumber: true,
    }, footer);
  
    fs.writeFile(resultDocxFilePath, fileBuffer, (error) => {
      if (error) {
        console.log('Docx file creation failed');
        return;
      }
      console.log('Docx file created successfully');
    });
  })();


  }, 1000);

}

creatApp();