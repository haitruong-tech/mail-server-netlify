import { google } from "googleapis";
const sheets = google.sheets("v4");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });
  const authToken = await auth.getClient();
  return authToken;
}

export async function getSpreadSheet({ spreadsheetId, auth }) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  return res;
}

export async function getSpreadSheetValues({ spreadsheetId, auth, sheetName }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName,
  });
  return res;
}

export async function addRow({ spreadsheetId, auth, range, values }) {
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    auth,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      majorDimension: "ROWS",
      values,
    },
  });
  return res;
}
