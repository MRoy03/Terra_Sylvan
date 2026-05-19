export const dynamic = 'force-static'

export async function GET() {
  const config = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? '',
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? '',
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? '',
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '',
    databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL       ?? '',
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

  const sw = `
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Terra Sylvan';
  const body  = payload.notification?.body  || 'You have a new message';
  const icon  = '${basePath}/favicon.svg';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    tag:   'terra-sylvan-msg',
    renotify: true,
    data: payload.data ?? {},
    vibrate: [100, 50, 100],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.chatUrl || '${basePath}/chat';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('${basePath}') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
`

  return new Response(sw.trim(), {
    headers: {
      'Content-Type':          'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control':          'no-cache',
    },
  })
}
