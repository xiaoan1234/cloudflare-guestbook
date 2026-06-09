import { c as defineEventHandler, g as getQuery } from '../../../_/nitro.mjs';
import { h as getTopMessages } from '../../../_/db.mjs';
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

const top_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = parseInt(query.limit) || 10;
  const topMessages = await getTopMessages(Math.min(limit, 50));
  return {
    success: true,
    messages: topMessages.map((msg) => ({
      id: msg.id,
      user: msg.user,
      text: msg.text.substring(0, 50) + (msg.text.length > 50 ? "..." : ""),
      views: msg.views || 0,
      createdAt: msg.createdAt
    }))
  };
});

export { top_get as default };
//# sourceMappingURL=top.get.mjs.map
