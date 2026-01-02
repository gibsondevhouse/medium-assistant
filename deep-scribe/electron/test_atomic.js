console.log("ATOMIC TEST START");
console.log("Process Versions:", process.versions);
try {
    const el = require('electron');
    console.log("Require Electron Type:", typeof el);
    console.log("Require Electron Keys:", Object.keys(el));
    if (el.app) {
        console.log("App object found.");
    } else {
        console.log("App object MISSING.");
    }
    try {
        const elMain = require('electron/main');
        console.log("Require electron/main Type:", typeof elMain);
        console.log("Require electron/main Keys:", Object.keys(elMain));
        if (elMain.app) console.log("electron/main App object found!");
    } catch (e) {
        console.log("Require electron/main failed:", e.message);
    }
} catch (e) {
    console.error("Require failed:", e);
}
console.log("ATOMIC TEST END");
if (require('electron').app) require('electron').app.quit();
