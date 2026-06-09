import { m as messages, u as users, g as getNextMessageId } from './store.mjs';

let memoryUsers = { ...users };
let memoryUserProfiles = {};
let memoryMessages = [...messages];
let memoryReplies = [];
let _db = null;
let _isCloudflareEnv = null;
function isCloudflareEnvironment() {
  var _a;
  if (_isCloudflareEnv !== null) return _isCloudflareEnv;
  try {
    if (typeof useCloudflare === "function") {
      try {
        const cf = useCloudflare();
        if ((_a = cf == null ? void 0 : cf.env) == null ? void 0 : _a.DB) {
          _isCloudflareEnv = true;
          return _isCloudflareEnv;
        }
      } catch {
      }
    }
    if (typeof globalThis !== "undefined") {
      if (globalThis.__cf_database_id || globalThis.__NUXT_HUB_DATABASE) {
        _isCloudflareEnv = true;
        return _isCloudflareEnv;
      }
    }
    _isCloudflareEnv = false;
  } catch {
    _isCloudflareEnv = false;
  }
  return _isCloudflareEnv;
}
function getDb() {
  var _a;
  if (_db) return _db;
  if (!isCloudflareEnvironment()) {
    throw new Error("\u6570\u636E\u5E93\u4E0D\u53EF\u7528\uFF0C\u4F7F\u7528\u5185\u5B58\u5B58\u50A8");
  }
  try {
    const cf = useCloudflare();
    if ((_a = cf == null ? void 0 : cf.env) == null ? void 0 : _a.DB) {
      const { drizzle } = require("drizzle-orm/d1");
      _db = drizzle(cf.env.DB);
      return _db;
    }
  } catch (error) {
    console.error("[db] \u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25:", error);
  }
  throw new Error("\u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25");
}
async function findUser(username) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { users } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u67E5\u8BE2\u7528\u6237:", username, result[0] ? "\u627E\u5230" : "\u672A\u627E\u5230");
      return result[0] || null;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u67E5\u8BE2\u5931\u8D25:", error);
      throw error;
    }
  }
  const user = memoryUsers[username];
  return user ? { username, ...user } : null;
}
async function createUser(username, password, role = "user") {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { users } = require("../database/schema");
      const result = await db.insert(users).values({ username, password, role }).returning();
      console.log("[db] \u5728D1\u6570\u636E\u5E93\u521B\u5EFA\u7528\u6237:", username);
      return result[0];
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u63D2\u5165\u5931\u8D25:", error);
      throw error;
    }
  }
  memoryUsers[username] = { password, role };
  return { username, password, role };
}
async function getUserProfile(username) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { userProfiles } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      const result = await db.select().from(userProfiles).where(eq(userProfiles.username, username)).limit(1);
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u67E5\u8BE2\u7528\u6237\u4E2A\u4EBA\u4FE1\u606F:", username);
      return result[0] || null;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u67E5\u8BE2\u7528\u6237\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25:", error);
      throw error;
    }
  }
  return memoryUserProfiles[username] || null;
}
async function upsertUserProfile(username, profile) {
  var _a;
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { userProfiles } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      const existing = await getUserProfile(username);
      if (existing) {
        const result = await db.update(userProfiles).set({ ...profile, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userProfiles.username, username)).returning();
        console.log("[db] \u5728D1\u6570\u636E\u5E93\u66F4\u65B0\u7528\u6237\u4E2A\u4EBA\u4FE1\u606F:", username);
        return result[0];
      } else {
        const result = await db.insert(userProfiles).values({ username, ...profile }).returning();
        console.log("[db] \u5728D1\u6570\u636E\u5E93\u521B\u5EFA\u7528\u6237\u4E2A\u4EBA\u4FE1\u606F:", username);
        return result[0];
      }
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u64CD\u4F5C\u7528\u6237\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25:", error);
      throw error;
    }
  }
  memoryUserProfiles[username] = {
    username,
    ...profile,
    createdAt: ((_a = memoryUserProfiles[username]) == null ? void 0 : _a.createdAt) || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return memoryUserProfiles[username];
}
async function getAllMessages() {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { messages, replies } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      const allMessages = await db.select().from(messages).orderBy(messages.createdAt);
      const messagesWithReplies = await Promise.all(
        allMessages.map(async (msg) => {
          const msgReplies = await db.select().from(replies).where(eq(replies.messageId, msg.id)).orderBy(replies.createdAt);
          return { ...msg, replies: msgReplies };
        })
      );
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u83B7\u53D6\u7559\u8A00:", messagesWithReplies.length, "\u6761");
      return messagesWithReplies;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u67E5\u8BE2\u7559\u8A00\u5931\u8D25:", error);
      throw error;
    }
  }
  return memoryMessages.map((msg) => ({
    ...msg,
    replies: memoryReplies.filter((r) => r.messageId === msg.id)
  }));
}
async function createMessage(user, text) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { messages } = require("../database/schema");
      const result = await db.insert(messages).values({ user, text, views: 0 }).returning();
      console.log("[db] \u5728D1\u6570\u636E\u5E93\u521B\u5EFA\u7559\u8A00:", user);
      return result[0];
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u63D2\u5165\u7559\u8A00\u5931\u8D25:", error);
      throw error;
    }
  }
  const id = getNextMessageId();
  const message = {
    id,
    user,
    text,
    views: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  memoryMessages.push(message);
  return message;
}
async function incrementMessageViews(messageId) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { messages } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      const msg2 = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
      if (!msg2[0]) return false;
      await db.update(messages).set({ views: (msg2[0].views || 0) + 1 }).where(eq(messages.id, messageId));
      console.log("[db] \u5728D1\u6570\u636E\u5E93\u589E\u52A0\u7559\u8A00\u6D4F\u89C8\u91CF:", messageId);
      return true;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u66F4\u65B0\u6D4F\u89C8\u91CF\u5931\u8D25:", error);
      throw error;
    }
  }
  const msg = memoryMessages.find((m) => m.id === messageId);
  if (msg) {
    msg.views = (msg.views || 0) + 1;
    return true;
  }
  return false;
}
async function getTopMessages(limit = 10) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { messages } = require("../database/schema");
      const result = await db.select().from(messages).orderBy(messages.views).limit(limit);
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u83B7\u53D6\u70ED\u95E8\u7559\u8A00:", result.length, "\u6761");
      return result.reverse();
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u67E5\u8BE2\u70ED\u95E8\u7559\u8A00\u5931\u8D25:", error);
      throw error;
    }
  }
  return [...memoryMessages].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}
async function deleteMessage(messageId) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { messages, replies } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      await db.delete(replies).where(eq(replies.messageId, messageId));
      await db.delete(messages).where(eq(messages.id, messageId));
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u5220\u9664\u7559\u8A00:", messageId);
      return true;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u5220\u9664\u7559\u8A00\u5931\u8D25:", error);
      throw error;
    }
  }
  memoryMessages = memoryMessages.filter((m) => m.id !== messageId);
  memoryReplies = memoryReplies.filter((r) => r.messageId !== messageId);
  return true;
}
async function createReply(messageId, user, text) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { replies } = require("../database/schema");
      const result = await db.insert(replies).values({ messageId, user, text }).returning();
      console.log("[db] \u5728D1\u6570\u636E\u5E93\u521B\u5EFA\u56DE\u590D:", user, "->", messageId);
      return result[0];
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u63D2\u5165\u56DE\u590D\u5931\u8D25:", error);
      throw error;
    }
  }
  const id = memoryReplies.length > 0 ? Math.max(...memoryReplies.map((r) => r.id || 0)) + 1 : 1;
  const reply = {
    id,
    messageId,
    user,
    text,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  memoryReplies.push(reply);
  return reply;
}
async function deleteReply(messageId, replyId) {
  if (isCloudflareEnvironment()) {
    try {
      const db = getDb();
      const { replies } = require("../database/schema");
      const { eq } = require("drizzle-orm");
      await db.delete(replies).where(eq(replies.id, replyId));
      console.log("[db] \u4ECED1\u6570\u636E\u5E93\u5220\u9664\u56DE\u590D:", replyId);
      return true;
    } catch (error) {
      console.error("[db] D1\u6570\u636E\u5E93\u5220\u9664\u56DE\u590D\u5931\u8D25:", error);
      throw error;
    }
  }
  memoryReplies = memoryReplies.filter((r) => !(r.messageId === messageId && r.id === replyId));
  return true;
}

export { deleteMessage as a, createMessage as b, createUser as c, deleteReply as d, createReply as e, findUser as f, getAllMessages as g, getTopMessages as h, incrementMessageViews as i, getUserProfile as j, upsertUserProfile as u };
//# sourceMappingURL=db.mjs.map
