import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

import {
  addRow,
  getAuthToken,
  getSpreadSheetValues,
} from "../../services/sheet";
import { sendMail } from "../../services/mail";
import fs from "fs";

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
    console.log({ event });
    console.log({ body: event.body });
    console.log("Handler");
    console.log(fs.readFileSync("portfolio-db.json", { encoding: "utf-8" }));
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
      console.log("Early return");
      return {
        headers,
        statusCode: 200,
        body: JSON.stringify("I've received your mail"),
      };
    }

    console.log("Add Contact");
    console.log(event.body);
    const contact = JSON.parse(event.body);

    await addContact(
      { ...contact, ip },
      auth,
      (response.data.values?.length ?? 0) + 1
    );
    // sendMail({ ...contact });
    console.log("Finish");

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
