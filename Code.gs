/**
 * @OnlyCurrentDoc
 *
 * ZSF Logo Research — response receiver
 *
 * The @OnlyCurrentDoc line above limits this script to the ONE spreadsheet
 * it's attached to — it can't see or touch anything else in your Google account.
 *
 * Paste this into Extensions → Apps Script of your Google Sheet,
 * then Deploy → New deployment → Web app (see README.md).
 *
 * Each submission becomes one row in the "Responses" tab,
 * with the drawing shown as an image right in the row.
 */

const SHEET_NAME = "Responses";
const HEADERS = [
  "Submitted", "Name", "Q1 How you feel", "Word 1", "Word 2", "Word 3",
  "Q3 Colour + why", "Drawing", "About the shape"
];
const DRAWING_COL = 8;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const words = Array.isArray(data.words) ? data.words : [];

    sheet.appendRow([
      new Date(),
      clean_(data.name),
      clean_(data.feel),
      clean_(words[0]),
      clean_(words[1]),
      clean_(words[2]),
      clean_(data.colour),
      "",
      clean_(data.shapeWhy)
    ]);
    const row = sheet.getLastRow();

    const drawing = String(data.drawing || "");
    if (drawing.startsWith("data:image/png;base64,") && drawing.length < 2000000) {
      try {
        const img = SpreadsheetApp.newCellImage()
          .setSourceUrl(drawing)
          .setAltTextTitle("Drawing from " + (clean_(data.name) || "anonymous"))
          .build();
        sheet.getRange(row, DRAWING_COL).setValue(img);
        sheet.setRowHeight(row, 160);
      } catch (imgErr) {
        sheet.getRange(row, DRAWING_COL).setValue("(drawing couldn't be saved)");
      }
    }

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
    sheet.setColumnWidth(DRAWING_COL, 280);
    sheet.getRange("C:I").setWrap(true);
  }
  return sheet;
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
