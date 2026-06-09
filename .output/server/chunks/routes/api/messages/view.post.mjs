import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { i as incrementMessageViews } from '../../../_/db.mjs';
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

const view_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body || {};
  if (!id) {
    throw createError({ statusCode: 400, message: "\u7559\u8A00 ID \u662F\u5FC5\u9700\u7684" });
  }
  const success = await incrementMessageViews(id);
  if (!success) {
    throw createError({ statusCode: 404, message: "\u7559\u8A00\u4E0D\u5B58\u5728" });
  }
  return { success: true };
});

export { view_post as default };
//# sourceMappingURL=view.post.mjs.map
