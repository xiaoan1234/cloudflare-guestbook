import { c as defineEventHandler } from '../../_/nitro.mjs';
import { g as getAllMessages } from '../../_/db.mjs';
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

const messages_get = defineEventHandler(async (event) => {
  const messages = await getAllMessages();
  return messages;
});

export { messages_get as default };
//# sourceMappingURL=messages.get.mjs.map
