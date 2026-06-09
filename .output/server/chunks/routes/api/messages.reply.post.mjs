import { c as defineEventHandler, r as readBody, e as createError } from '../../_/nitro.mjs';
import { m as messages } from '../../_/store.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'node:url';

const messages_reply_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { id, text, user } = body;
  const msg = messages.find((m) => m.id === id);
  if (!msg) throw createError({ statusCode: 404, statusMessage: "\u672A\u627E\u5230\u7559\u8A00" });
  const rid = (((_a = msg.replies[msg.replies.length - 1]) == null ? void 0 : _a.id) || 0) + 1;
  msg.replies.push({ id: rid, user: user || "\u533F\u540D", text: text || "", createdAt: (/* @__PURE__ */ new Date()).toISOString() });
  return { ok: true };
});

export { messages_reply_post as default };
//# sourceMappingURL=messages.reply.post.mjs.map
