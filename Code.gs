/**
 * ZSF Logo Research — response receiver
 *
 * Paste this into Extensions → Apps Script of your Google Sheet,
 * then Deploy → New deployment → Web app (see README.md).
 *
 * Each submission becomes one row in the "Responses" tab.
 * Drawings are saved as PNG files in a Drive folder called
 * "ZSF Logo Research – Drawings", and the row links to the file.
 */

const SHEET_NAME = "Responses";
const FOLDER_NAME = "ZSF Logo Research – Drawings";
const HEADERS = [
  "Submitted", "Name", "Q1 How you feel", "Word 1", "Word 2", "Word 3",
  "Q3 Colour + why", "About the shape", "Drawing (link)"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const when = new Date();

    let link = "";
    if (data.drawing && String(data.drawing).startsWith("data:image/png;base64,")) {
      const bytes = Utilities.base64Decode(data.drawing.split(",")[1]);
      const safeName = clean_(data.name || "anonymous").replace(/[^\w\- ]+/g, "").slice(0, 40) || "anonymous";
      const stamp = Utilities.formatDate(when, Session.getScriptTimeZone(), "yyyy-MM-dd HHmmss");
      const blob = Utilities.newBlob(bytes, "image/png", stamp + " - " + safeName + ".png");
      const file = getFolder_().createFile(blob);
      link = file.getUrl();
    }

    const words = Array.isArray(data.words) ? data.words : [];
    sheet.appendRow([
      when,
      clean_(data.name),
      clean_(data.feel),
      clean_(words[0]),
      clean_(words[1]),
      clean_(words[2]),
      clean_(data.colour),
      clean_(data.shapeWhy),
      link
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the web app URL in a browser shows this — handy to confirm it's live.
function doGet() {
  return json_({ ok: true, message: "ZSF survey receiver is running." });
}

// ---------- helpers ----------
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("FOLDER_ID");
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* recreated below */ }
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty("FOLDER_ID", folder.getId());
  return folder;
}

// Trim, cap length, and stop text being read as a spreadsheet formula
function clean_(v) {
  let s = (v == null ? "" : String(v)).trim().slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
