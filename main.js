const Store = require('electron-store');
Store.initRenderer();

// TODO: FIX THE ELECTRON STORE PELASE

const {
    app,
    BrowserWindow,
    globalShortcut,
    shell,
    ipcMain,
} = require("electron");

const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyC3bVHFPlQlqFRVNpgACjEZnGoFlB5Dbjs",
    authDomain: "chat-v2-654bb.firebaseapp.com",
    projectId: "chat-v2-654bb",
    storageBucket: "chat-v2-654bb.appspot.com",
    messagingSenderId: "996020677176",
    appId: "1:996020677176:web:753898bbd6fb1acc7014cd",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

var name;

const ipc = ipcMain;

function createWindow() {
    const win = new BrowserWindow({
        minWidth: 1200,
        minHeight: 800,
        icon: __dirname + "/assets/icon.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,
        autoHideMenuBar: true,
    });

    win.loadFile("./src/index.html");
    win.maximize()
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    ipc.on("min", () => {
        win.minimize()
    })
    ipc.on("max", () => {
        if (win.isMaximized()) {
            win.restore()
        } else {
            win.maximize()
        }
    })
    ipc.on("close", () => {
        win.close()
    })
}

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
    if (process.platform !== "darwin") {
        const onlineRef = db.collection("info").doc("online");
        const onlineDoc = await onlineRef.get();
        const onlineData = onlineDoc.exists ? onlineDoc.data() : {};

        if (onlineData.people && onlineData.people.includes(name)) {
            const index = onlineData.people.indexOf(name);
            if (index > -1) {
                onlineData.people.splice(index, 1);
            }

            await onlineRef.set({ people: onlineData.people });
        }

        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
