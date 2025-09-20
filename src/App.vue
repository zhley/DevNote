<template>
    <div class="app-container">
        <MenuBar />
        <Workspace class="main-content"/>
    </div>
</template>

<script setup lang="ts">
import Workspace from "./components/Workspace.vue";
import MenuBar from "./components/MenuBar.vue";
import { onMounted } from 'vue'
import { initProject } from './api/project'

onMounted(async () => {
    await initProject()
})
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.main-content {
    flex: 1;
    overflow: hidden;
}
</style>