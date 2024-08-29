import axios from "axios";

import { getAccessToken } from "@/services/googleAuth";

export async function sendNotification(
  token: string,
  title: string,
  body: string
) {
  const bearer = await getAccessToken();

  const key = `Bearer ${bearer}`;

  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/v1/projects/sapati-20d50/messages:send",
      createMessage(token, title, body),

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: key,
        },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

const createMessage = (token: any, title: string, description: any) => {
  return {
    message: {
      token: token,
      notification: {
        title: title,
        body: description,
      },
    },
  };
};
