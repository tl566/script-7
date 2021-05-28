```js
on("scan", (qrcode) => {
  qrcodeTerminal.generate(qrcode);
});
```

```js
on("message", (msg) => {
  if ((msg, self())) {
    return;
  }

  if (msg.type() !== bot.Message.Type.Text) {
    return;
  }

  const content = msg.text();
  const contact = msg.from();
  const room = message.room();

  if (room) {
    // 是群聊
  } else {
    私聊;
  }
});
```

获取消息体：content
获取发消息人：contact.name()
获取群聊房间：await room.topic()

```js
if (/ding/.test(content)) {
  const dingRoom = await bot.Room.find({ topic: "ding" });
  if (dingRoom) {
    await dingRoom.add(contact);
    dingRoom.say("welcome", contact);
  }
}

if (/fword/.test(content)) {
  const dingRoom = await bot.Room.find({ topic: "ding" });
  if (dingRoom) {
    dingRoom.say("Bye!!!", contact);
    await dingRoom.del(contact);
  }
}
```
