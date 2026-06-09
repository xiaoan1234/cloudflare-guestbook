import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { j as getUserProfile } from '../../../_/db.mjs';
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

const profile_get = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username } = body || {};
  if (!username) {
    throw createError({ statusCode: 400, message: "\u7528\u6237\u540D\u662F\u5FC5\u9700\u7684" });
  }
  const profile = await getUserProfile(username);
  if (!profile) {
    return {
      username,
      age: null,
      gender: null,
      email: null,
      phone: null,
      bio: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  return profile;
});

export { profile_get as default };
//# sourceMappingURL=profile.get.mjs.map
