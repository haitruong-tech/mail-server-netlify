import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

import {
  addRow,
  getAuthToken,
  getSpreadSheetValues,
} from "../../services/sheet";
import { sendMail } from "../../services/mail";

const spreadsheetId = process.env.SPREAD_SHEET_ID;
const sheetName = process.env.SHEET_NAME;

async function addContact({ name, email, content, ip }, position) {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth,
    });
    const row = (response?.data?.values?.length ?? 0) + 1;
    const updateResponse = await addRow({
      auth,
      range: `${sheetName}!A${row}:F${row}`,
      spreadsheetId,
      // id, name, email, content, created_at, ip
      values: [[uuidv4(), name, email, content, new Date().toISOString(), ip]],
    });
    return updateResponse.status;
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

const headers = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST",
};

export const handler = async (event, context) => {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth,
    });

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const mails = response.data.values?.filter(
      (mail) => new Date(mail[4]).getTime() > date.getTime()
    );
    if (mails.length >= 5) {
      return {
        headers,
        statusCode: 200,
        body: JSON.stringify("I've received your mail"),
      };
    }

    const contact = JSON.parse(event.body);
    const ip = event.headers["client-ip"];
    addContact({ ...contact, ip });
    sendMail({ ...contact });

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify("I've received your mail"),
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      //   "Access-Control-Allow-Headers": "Content-Type",
      //   "Access-Control-Allow-Methods": "GET, POST",
      // },
    };
  } catch (error) {
    console.error(error);
    return {
      headers,
      statusCode: 500,
      body: JSON.stringify("Something went wrong"),
    };
  }
};
