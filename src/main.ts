import { createApp } from "vue";
import App from "./App.vue";
import CommandWindow from "./views/CommandWindow.vue";
import EditorWindow from "./views/EditorWindow.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

const currentWindow = await getCurrentWindow();

let rootComponent;
if(currentWindow.label === 'command'){
    rootComponent = CommandWindow;
}else if(currentWindow.label === 'editor'){
    rootComponent = EditorWindow;
}else{
    rootComponent = App;
}

const app = createApp(rootComponent);
app.use(ElementPlus)
app.mount('#app')
