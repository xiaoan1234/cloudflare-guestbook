import { c as defineEventHandler, r as readBody, e as createError } from '../../_/nitro.mjs';
import { f as findUser, c as createUser } from '../../_/db.mjs';
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

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, isRegister } = body || {};
  if (!username || !password) {
    throw createError({ statusCode: 400, message: "\u53C2\u6570\u7F3A\u5931" });
  }
  if (!/^[一-龥]+[一-龥0-9]*$/.test(username)) {
    throw createError({ statusCode: 400, message: "\u7528\u6237\u540D\u5FC5\u987B\u4E3A\u4E2D\u6587\uFF08\u53EF\u4EE5\u5305\u542B\u6570\u5B57\uFF09" });
  }
  if (!/^\d{6,}$/.test(password)) {
    throw createError({ statusCode: 400, message: "\u5BC6\u7801\u5FC5\u987B\u4E3A\u81F3\u5C116\u4F4D\u6570\u5B57" });
  }
  const existingUser = await findUser(username);
  if (isRegister) {
    if (existingUser) {
      throw createError({ statusCode: 409, message: "\u8BE5\u7528\u6237\u540D\u5DF2\u88AB\u6CE8\u518C" });
    }
    const newUser = await createUser(username, password, "user");
    console.log("[login] \u6CE8\u518C\u65B0\u7528\u6237\uFF1A", username);
    return {
      success: true,
      token: `${username}-${Date.now()}`,
      role: newUser.role
    };
  } else {
    if (!existingUser) {
      if (username === "\u7BA1\u7406\u5458" && password === "1314520") {
        const adminUser = await createUser("\u7BA1\u7406\u5458", "1314520", "admin");
        console.log("[login] \u81EA\u52A8\u521B\u5EFA\u7BA1\u7406\u5458\u8D26\u53F7");
        return {
          success: true,
          token: `${username}-${Date.now()}`,
          role: adminUser.role
        };
      }
      throw createError({ statusCode: 401, message: "\u7528\u6237\u4E0D\u5B58\u5728" });
    }
    if (existingUser.password !== password) {
      throw createError({ statusCode: 401, message: "\u5BC6\u7801\u9519\u8BEF" });
    }
    console.log("[login] \u767B\u5F55\u6210\u529F\uFF1A", username);
    return {
      success: true,
      token: `${username}-${Date.now()}`,
      role: existingUser.role
    };
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
