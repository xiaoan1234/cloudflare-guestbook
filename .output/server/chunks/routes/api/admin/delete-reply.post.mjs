import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { g as getAllMessages, d as deleteReply } from '../../../_/db.mjs';
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

const deleteReply_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { messageId, replyId } = body;
  const messages = await getAllMessages();
  const msg = messages.find((m) => m.id === messageId);
  if (!msg) {
    throw createError({ statusCode: 404, statusMessage: "\u672A\u627E\u5230\u7559\u8A00" });
  }
  const reply = (_a = msg.replies) == null ? void 0 : _a.find((r) => r.id === replyId);
  if (!reply) {
    throw createError({ statusCode: 404, statusMessage: "\u672A\u627E\u5230\u56DE\u590D" });
  }
  await deleteReply(messageId, replyId);
  return { success: true };
});

export { deleteReply_post as default };
//# sourceMappingURL=delete-reply.post.mjs.map
