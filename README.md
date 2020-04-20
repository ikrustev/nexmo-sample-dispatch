# Nexmo Dispatch Sample

#### Overview

The sample acts as a REST server accepting Nexmo webhook requests and providing endpoints to execute the sample code.  

#### Install dependencies
```
npm install
```

#### Prepare config file
Copy provided template and fill in:
```
cp env-template .env
```

#### Webhook setup.

Start ngrok:
```
ngrok http 3000 
```

Use provided js to query ngrok public url and setup the nexmo app webhooks
```
node set-app-webhook.js
```

#### Start

```
node index.js
```

#### Try

Send SMS

```
curl -X POST http://localhost:3000/api/messages -d'{"type":"sms", "to":"<RECIPIENT-NUMBER>", "content": {"type":"text", "text":"Sent via Nexmo Messaging & Dispatch API"}}'
```

Send text to Facebook messenger

```
curl -X POST http://localhost:3000/api/messages -d'{"type":"messenger", "to":"<FACEBOOK-RECIPINET-ID>", "content": {"type":"text", "text":"Sent via Nexmo Messaging & Dispatch API"}}'
```

Send image to Facebook messenger

```
curl -X POST http://localhost:3000/api/messages -d'{"type":"messenger", "to":"FACEBOOK-RECIPINET-ID", "content": {"type":"image", "image":{"url":"https://nynja-defaults.s3.us-west-2.amazonaws.com/c7ba03b3-9e23-4c91-acdb-be41923c7f66_cloth.png"}}}'
```

Execute dispatch fallback workflow

```
curl -X POST http://localhost:3000/api/dispatch -d'{"to":"RECIPIENT-NUMBER", "fallback":"FACEBOOK-RECIPINET-ID", "text": "Your item has been delivered", "image_url":"https://nynja-defaults.s3.us-west-2.amazonaws.com/c7ba03b3-9e23-4c91-acdb-be41923c7f66_cloth.png"}'
```
