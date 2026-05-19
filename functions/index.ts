import * as functions from 'firebase-functions'
import * as admin     from 'firebase-admin'

admin.initializeApp()
const db  = admin.firestore()
const fcm = admin.messaging()

export const onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{msgId}')
  .onCreate(async (snap, context) => {
    const msg      = snap.data()
    const chatId   = context.params.chatId
    const senderId = msg.senderId as string
    const content  = msg.type === 'text' ? (msg.content as string) : `[${msg.type}]`

    // Get chat to find recipient
    const chatSnap  = await db.doc(`chats/${chatId}`).get()
    const chat      = chatSnap.data()
    if (!chat) return

    const recipientUid = (chat.participants as string[]).find(uid => uid !== senderId)
    if (!recipientUid) return

    // Get recipient's FCM token and sender's display name
    const [recipientSnap, senderSnap] = await Promise.all([
      db.doc(`users/${recipientUid}`).get(),
      db.doc(`users/${senderId}`).get(),
    ])

    const recipientData = recipientSnap.data()
    const senderData    = senderSnap.data()
    const fcmToken      = recipientData?.fcmToken as string | undefined
    if (!fcmToken) return

    const senderName = senderData?.displayName ?? 'Someone'
    const basePath   = process.env.BASE_PATH ?? ''

    await fcm.send({
      token: fcmToken,
      notification: {
        title: `🌿 ${senderName}`,
        body:  content.length > 80 ? content.slice(0, 80) + '…' : content,
      },
      data: {
        chatUrl: `${basePath}/chat`,
        chatId,
      },
      webpush: {
        notification: {
          icon:  `${basePath}/favicon.svg`,
          badge: `${basePath}/favicon.svg`,
          tag:   'terra-sylvan-msg',
          renotify: 'true',
          vibrate: '100,50,100',
        },
        fcmOptions: { link: `${basePath}/chat` },
      },
    })
  })
