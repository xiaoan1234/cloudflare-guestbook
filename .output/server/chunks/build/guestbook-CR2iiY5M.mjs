import { defineComponent, ref, reactive, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, d as useRouter } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TopMessages",
  __ssrInlineRender: true,
  emits: ["jump-to-message"],
  setup(__props, { emit: __emit }) {
    const topMessages = ref([]);
    const loading = ref(false);
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString("zh-CN");
    };
    const getRankBadge = (index) => {
      switch (index) {
        case 0:
          return "🥇";
        case 1:
          return "🥈";
        case 2:
          return "🥉";
        default:
          return `${index + 1}`;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "top-sidebar" }, _attrs))} data-v-a024cf42><div class="sidebar-header" data-v-a024cf42><h3 data-v-a024cf42>🔥 热门留言榜</h3><button class="refresh-btn" data-v-a024cf42>刷新</button></div>`);
      if (loading.value) {
        _push(`<div class="loading" data-v-a024cf42>加载中...</div>`);
      } else if (topMessages.value.length === 0) {
        _push(`<div class="empty" data-v-a024cf42> 暂无留言排行 </div>`);
      } else {
        _push(`<div class="top-list" data-v-a024cf42><!--[-->`);
        ssrRenderList(topMessages.value, (msg, index) => {
          _push(`<div class="top-item" data-v-a024cf42><div class="rank" data-v-a024cf42>${ssrInterpolate(getRankBadge(index))}</div><div class="content" data-v-a024cf42><div class="user" data-v-a024cf42>${ssrInterpolate(msg.user)}</div><div class="text" data-v-a024cf42>${ssrInterpolate(msg.text)}</div><div class="meta" data-v-a024cf42><span class="views" data-v-a024cf42>👁 ${ssrInterpolate(msg.views)}</span><span class="date" data-v-a024cf42>${ssrInterpolate(formatDate(msg.createdAt))}</span></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TopMessages.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-a024cf42"]]), { __name: "TopMessages" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "guestbook",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const user = ref("");
    ref("");
    const role = ref("");
    const messages = ref([]);
    const newMessage = ref("");
    const replyText = reactive({});
    const showReplyInput = reactive({});
    const messageRefs = ref({});
    const incrementViews = async (id) => {
      try {
        await $fetch("/api/messages/view", {
          method: "POST",
          body: { id }
        });
        const msg = messages.value.find((m) => m.id === id);
        if (msg) {
          msg.views = (msg.views || 0) + 1;
        }
      } catch (e) {
        console.error("更新浏览量失败:", e);
      }
    };
    const jumpToMessage = async (id) => {
      await incrementViews(id);
      await nextTick();
      const element = messageRefs.value[id];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight");
        setTimeout(() => {
          element.classList.remove("highlight");
        }, 2e3);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TopMessages = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "guestbook-layout" }, _attrs))} data-v-1cb57008><div class="main-content" data-v-1cb57008><div class="container" data-v-1cb57008><div class="header" data-v-1cb57008><h1 data-v-1cb57008>📝 留言板</h1><div class="user-info" data-v-1cb57008><span data-v-1cb57008>当前用户：<strong data-v-1cb57008>${ssrInterpolate(user.value)}</strong></span>`);
      if (role.value === "admin") {
        _push(`<span class="admin-badge" data-v-1cb57008>管理员</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="profile-btn" data-v-1cb57008>👤 个人中心</button><button class="logout-btn" data-v-1cb57008>退出</button></div></div><div class="post-form" data-v-1cb57008><textarea placeholder="写下你的留言..." rows="3" data-v-1cb57008>${ssrInterpolate(newMessage.value)}</textarea><button data-v-1cb57008>发布留言</button></div><div class="messages" data-v-1cb57008><!--[-->`);
      ssrRenderList(messages.value, (msg) => {
        _push(`<div class="message-item" data-v-1cb57008><div class="message-header" data-v-1cb57008><div class="user-info-left" data-v-1cb57008><strong data-v-1cb57008>${ssrInterpolate(msg.user)}</strong><span class="views-count" data-v-1cb57008>👁 ${ssrInterpolate(msg.views || 0)}</span></div><span class="time" data-v-1cb57008>${ssrInterpolate(new Date(msg.createdAt).toLocaleString())}</span></div><p class="message-text" data-v-1cb57008>${ssrInterpolate(msg.text)}</p>`);
        if (role.value === "admin") {
          _push(`<div class="admin-actions" data-v-1cb57008><button class="delete-btn" data-v-1cb57008>删除留言</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (msg.replies && msg.replies.length > 0) {
          _push(`<div class="replies" data-v-1cb57008><!--[-->`);
          ssrRenderList(msg.replies, (rep) => {
            _push(`<div class="reply-item" data-v-1cb57008><strong data-v-1cb57008>${ssrInterpolate(rep.user)}</strong>：${ssrInterpolate(rep.text)} `);
            if (role.value === "admin") {
              _push(`<button class="delete-reply-btn" data-v-1cb57008>删除</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="reply-btn" data-v-1cb57008>回复</button>`);
        if (showReplyInput[msg.id]) {
          _push(`<div class="reply-form" data-v-1cb57008><input${ssrRenderAttr("value", replyText[msg.id])} placeholder="输入回复..." data-v-1cb57008><button data-v-1cb57008>发送回复</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (!messages.value || messages.value.length === 0) {
        _push(`<div class="empty" data-v-1cb57008> 暂无留言，快来发布第一条吧！ </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="sidebar" data-v-1cb57008>`);
      _push(ssrRenderComponent(_component_TopMessages, { onJumpToMessage: jumpToMessage }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guestbook.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guestbook = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1cb57008"]]);

export { guestbook as default };
//# sourceMappingURL=guestbook-CR2iiY5M.mjs.map
