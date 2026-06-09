import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { g as getAllMessages, e as createReply } from '../../../_/db.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'node:url';
import '../../../_/store.mjs';

const reply_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, text, user } = body;
  const messages = await getAllMessages();
  const msg = messages.find((m) => m.id === id);
  if (!msg) {
    throw createError({ statusCode: 404, statusMessage: "\u672A\u627E\u5230\u7559\u8A00" });
  }
  const reply = await createReply(id, user || "\u533F\u540D", text || "");
  return { success: true, reply };
});

export { reply_post as default };
//# sourceMappingURL=reply.post.mjs.map
