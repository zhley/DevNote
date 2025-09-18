<template>
    <div class="app-container">
        <MenuBar />
        <div class="main-content">
            <Workspace />
        </div>
        <StatusBar />
    </div>
</template>

<script setup lang="ts">
import Workspace from "./components/Workspace.vue";
import MenuBar from "./components/MenuBar.vue";
import StatusBar from "./components/StatusBar.vue";
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