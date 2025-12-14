# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Android Eas Build
1. Developement
```bash
eas build --profile development --platform android
```

2. Test
```bash
eas build --profile test --platform android
```

3. Production
```bash
eas build --profile production --platform android
```




{
    "to": "USER_EXPO_PUSH_TOKEN",
    "sound": "default",
    "title": "New Message",
    "body": "You have a new message from our support agent.",
    "data": {
        "href": "/chat"
    }
}

{
    "to": "AGENT_EXPO_PUSH_TOKEN",
    "sound": "default",
    "title": "New Message from Jane Doe",
    "body": "I have a question about my subscription.",
    "data": {
        "href": "/chat/agentChatDetail?id=CHAT_ID_HERE&userName=USER_NAME_HERE"
    }
}