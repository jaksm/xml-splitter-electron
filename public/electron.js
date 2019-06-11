const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
const fs = require("fs");
const { ipcMain, dialog } = require("electron");

let mainWindow;

ipcMain.on("request-xml-export", (event, xmlContents) => {
  dialog.showOpenDialog(
    mainWindow,
    {
      title: "Save xml files",
      buttonLabel: "Save",
      properties: ["openDirectory"]
    },
    filePaths => {
      if (filePaths.length > 0) {
        const path = filePaths[0];
        const writeFile = ({ fileName, content }) =>
          new Promise((resolve, reject) => {
            fs.writeFile(`${path}/${fileName}`, content, { encoding: "utf8" }, err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });

        const promises = xmlContents.map(file => writeFile(file));

        Promise.all(promises)
          .then(() => {
            dialog.showMessageBox({ message: "Files saved!", type: "info" });
          })
          .catch(error => {
            dialog.showErrorBox("Error saving files", error);
          });
      }
    }
  );
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + "/preload.js"
    }
  });
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
