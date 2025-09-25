import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"

// 根据当前路径决定渲染什么组件
const currentPath = window.location.hash.slice(1) || window.location.pathname

if (currentPath === '/command' || currentPath === '/editor') {
  // 对于快捷窗口，只使用路由
  const app = createApp({
    template: '<router-view />'
  });
  app.use(router);
  app.use(ElementPlus);
  app.mount("#app");
} else {
  // 对于主窗口，使用完整的 App 组件
  const app = createApp(App);
  app.use(ElementPlus);
  app.mount("#app");
}
