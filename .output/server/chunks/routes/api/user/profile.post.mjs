import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { u as upsertUserProfile } from '../../../_/db.mjs';
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

const profile_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, profile } = body || {};
  if (!username) {
    throw createError({ statusCode: 400, message: "\u7528\u6237\u540D\u662F\u5FC5\u9700\u7684" });
  }
  if (profile.age !== void 0 && profile.age !== null) {
    if (typeof profile.age !== "number" || profile.age < 0 || profile.age > 150) {
      throw createError({ statusCode: 400, message: "\u5E74\u9F84\u5FC5\u987B\u662F0-150\u4E4B\u95F4\u7684\u6570\u5B57" });
    }
  }
  if (profile.email !== void 0 && profile.email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      throw createError({ statusCode: 400, message: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740" });
    }
  }
  if (profile.phone !== void 0 && profile.phone !== null) {
    const phoneRegex = /^[\d\-+\s()]{7,15}$/;
    if (!phoneRegex.test(profile.phone)) {
      throw createError({ statusCode: 400, message: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u8BDD\u53F7\u7801" });
    }
  }
  const updatedProfile = await upsertUserProfile(username, {
    age: profile.age || null,
    gender: profile.gender || null,
    email: profile.email || null,
    phone: profile.phone || null,
    bio: profile.bio || null
  });
  console.log("[profile] \u66F4\u65B0\u7528\u6237\u4FE1\u606F\uFF1A", username);
  return { success: true, profile: updatedProfile };
});

export { profile_post as default };
//# sourceMappingURL=profile.post.mjs.map
