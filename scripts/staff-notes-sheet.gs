/**
 * Visage Aesthetics — patient notes webhook
 *
 * One-time setup:
 *   1. Open the patient notes Google Sheet (the one with columns
 *      "Submitted On", "Name", "Date of treatment", ... "Date Signed").
 *   2. Extensions → Apps Script. Paste this whole file in. Save.
 *   3. Project Settings → Script properties → add:
 *        SHARED_SECRET   =  (any long random string — copy this)
 *   4. Deploy → New deployment → type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Authorise. Copy the deployment URL — it ends with /exec.
 *   5. In Vercel (or .env.local) on the Visage site, set:
 *        STAFF_NOTES_WEBHOOK_URL    = the /exec URL from step 4
 *        STAFF_NOTES_WEBHOOK_SECRET = the SHARED_SECRET from step 3
 *        STAFF_PIN                  = the passcode Bernadette will type
 *
 * If you ever change the script, deploy a NEW version (Deploy → Manage
 * deployments → edit → new version) so the /exec URL keeps working.
 */

const SHEET_NAME = 'Sheet1';

const COLUMN_ORDER = [
  'name',                       // B  Name
  'dateOfTreatment',            // C  Date of treatment
  'treatment',                  // D  Treatment
  'specificArea',               // E  Specific Area treated
  'productUsed',                // F  Product Used
  'lotNoExp',                   // G  Lot No/Exp
  'dosage',                     // H  Dosage
  'beforePhotosTaken',          // I  Before photos taken
  'problemsNoted',              // J  Any problems / abnormality
  'aftercareProvided',          // K  Aftercare instructions provided
  'additionalNotes',            // L  Additional notes
  'emergencyContactProvided',   // M  Emergency contact details provided
  'dateSigned',                 // N  Date Signed
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!expected || body.secret !== expected) {
      return jsonOut({ error: 'Unauthorised' }, 401);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    const submittedOn = Utilities.formatDate(
      new Date(),
      ss.getSpreadsheetTimeZone() || 'Europe/London',
      'dd/MM/yyyy HH:mm:ss'
    );

    const row = [submittedOn].concat(COLUMN_ORDER.map(function (key) {
      const value = body[key];
      return value == null ? '' : String(value);
    }));

    sheet.appendRow(row);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ error: String(err) }, 500);
  }
}

function doGet() {
  return jsonOut({ ok: true, hint: 'POST patient notes here.' });
}

function jsonOut(payload, _status) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
