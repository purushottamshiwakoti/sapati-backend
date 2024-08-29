import axios from "axios";

import { getAccessToken } from "@/services/googleAuth";

export async function sendNotification(
  token: string,
  title: string,
  body: string
) {
  const bearer = await getAccessToken();

  const key = `Bearer ${bearer}`;
  console.log(token);
  console.log(`key`);
  // await axios.post('https://fcm.googleapis.com/fcm/send', {
  //     'priority': 'high',
  //     'to': token,
  //     'notification': { 'title': title, 'body': body },
  //     'data': {
  //         'title': 'がんばることを登録しよう',
  //         'body': 'がんばることをひとつでも登録してスタンプをおくってみよう！',

  //     },
  //     'click_action': 'FLUTTER_NOTIFICATION_CLICK',
  // }, {
  //     'headers': {
  //         'Content-Type': 'application/json',
  //         'Authorization': `key=${process.env.FCM_KEY}`,
  //     },
  // }).catch((e:any) => {
  //     1
  //     console.log(`Parent Token Error Sending Notification ${e}`);
  // }).then((res:any) =>
  //     console.log(`Response :${JSON.stringify(res.data)}`),
  // );

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

    console.log({ response });
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
