import { createApp } from "vue";
import App from "./App.vue";
import CommandWindow from "./views/CommandWindow.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 禁用浏览器默认右键菜单（仅在生产环境）
function disableContextMenu() {
    if (import.meta.env.PROD) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
}

async function initApp() {
    try {
        const currentWindow = await getCurrentWindow();
        
        let rootComponent;
        if(currentWindow.label === 'command'){
            rootComponent = CommandWindow;
        }else{
            rootComponent = App;
        }

        const app = createApp(rootComponent);
        app.use(ElementPlus);
        app.mount('#app');
        
        // 禁用右键菜单
        disableContextMenu();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // 如果获取窗口信息失败，默认使用主应用
        const app = createApp(App);
        app.use(ElementPlus);
        app.mount('#app');
        
        // 禁用右键菜单
        disableContextMenu();
    }
}

initApp();
