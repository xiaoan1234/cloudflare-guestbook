const users = {
  "\u7BA1\u7406\u5458": { password: "1314520", role: "admin" }
};
let messages = [
  {
    id: 1,
    user: "\u7CFB\u7EDF",
    text: "\u6B22\u8FCE\u4F7F\u7528\u7559\u8A00\u677F\uFF01",
    replies: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    views: 0
  }
];
function getNextMessageId() {
  return messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;
}

export { getNextMessageId as g, messages as m, users as u };
//# sourceMappingURL=store.mjs.map
