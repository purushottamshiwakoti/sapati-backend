import axios from "axios"

export async function sendNotification(token:string) {
    console.log(token)
    console.log(`key`)
    await axios.post('https://fcm.googleapis.com/fcm/send', {
        'priority': 'high',
        'to': token,
        'notification': { 'title': 'bndsnbds', 'body': 'sdnbsdbnds' },
        'data': {
            'title': 'がんばることを登録しよう',
            'body': 'がんばることをひとつでも登録してスタンプをおくってみよう！',
            
        },
        'click_action': 'FLUTTER_NOTIFICATION_CLICK',
    }, {
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `key=${process.env.FCM_KEY}`,
        },
    }).catch((e:any) => {
        1
        console.log(`Parent Token Error Sending Notification ${e}`);
    }).then((res:any) =>
        console.log(`Response :${JSON.stringify(res.data)}`),
    );
}