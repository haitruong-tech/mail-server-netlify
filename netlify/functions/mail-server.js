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

async function addContact({ name, email, content, ip }, auth, position) {
  try {
    const updateResponse = await addRow({
      auth,
      range: `${sheetName}!A${position}:F${position}`,
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
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
};

export const handler = async (event, context) => {
  try {
    if (event.headers.origin !== "https://haitruongdev.com") {
      return {
        headers,
        statusCode: 405,
        body: JSON.stringify("Not allowed"),
      };
    }
    const ip = event.headers["client-ip"];
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth,
    });

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const mails = response.data.values?.filter(
      (mail) => new Date(mail[4]).getTime() > date.getTime() && mail[5] === ip
    );
    if (mails.length >= 5) {
      return {
        headers,
        statusCode: 200,
        body: JSON.stringify("I've received your mail"),
      };
    }

    const contact = JSON.parse(event.body);

    await Promise.all([
      addContact(
        { ...contact, ip },
        auth,
        (response.data.values?.length ?? 0) + 1
      ),
      sendMail({ ...contact }),
    ]);

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify("I've received your mail"),
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
