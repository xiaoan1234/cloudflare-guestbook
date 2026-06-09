import { c as defineEventHandler, r as readBody, e as createError } from '../../_/nitro.mjs';
import { b as createMessage } from '../../_/db.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'node:url';
import '../../_/store.mjs';

const messages_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body || !body.text) {
    throw createError({ statusCode: 400, statusMessage: "\u53C2\u6570\u7F3A\u5931" });
  }
  const message = await createMessage(body.user || "\u533F\u540D", body.text);
  return { success: true, message };
});

export { messages_post as default };
//# sourceMappingURL=messages.post.mjs.map
