<template>
  <a-layout style="min-height: 100vh; background-color: #0b0f19">
    <!-- Header/Navigation -->
    <a-layout-header
      style="
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 0 24px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
        border-bottom: 1px solid #1f2937;
      "
    >
      <div style="display: flex; align-items: center; gap: 16px; flex: 1">
        <div style="font-size: 24px">📊</div>
        <h1
          style="
            margin: 0;
            color: #f1f5f9;
            font-family: var(--font-heading);
            font-size: 20px;
            font-weight: 700;
          "
        >
          PostgreSQL Query Performance Hub
        </h1>
      </div>

      <a-menu
        theme="dark"
        mode="horizontal"
        :selected-keys="[activeMenu]"
        style="
          flex: 1;
          background: transparent;
          border: none;
          display: flex;
          justify-content: flex-end;
        "
      >
        <a-menu-item
          key="dashboard"
          @click="navigateTo('dashboard')"
          style="color: #cbd5e1"
        >
          <template #icon>
            <dashboard-outlined style="font-size: 16px" />
          </template>
          Dashboard
        </a-menu-item>
        <a-menu-item
          key="users"
          @click="navigateTo('users')"
          style="color: #cbd5e1"
        >
          <template #icon>
            <team-outlined style="font-size: 16px" />
          </template>
          Users
        </a-menu-item>
        <a-menu-item
          key="posts"
          @click="navigateTo('posts')"
          style="color: #cbd5e1"
        >
          <template #icon>
            <file-text-outlined style="font-size: 16px" />
          </template>
          Posts
        </a-menu-item>
      </a-menu>
    </a-layout-header>

    <!-- Main Content -->
    <a-layout-content
      style="padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%"
    >
      <router-view />
    </a-layout-content>

    <!-- Footer -->
    <a-layout-footer
      style="
        text-align: center;
        background: #0b0f19;
        border-top: 1px solid #1f2937;
        color: #64748b;
        padding: 24px;
      "
    >
      <p style="margin: 0; font-size: 14px">
        PostgreSQL CRUD with Prisma ORM • TypeScript • Vue 3 • Ant Design
        <br />
        <span style="font-size: 12px; opacity: 0.8"
          >Built with modern web technologies for optimal performance</span
        >
      </p>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const activeMenu = ref("dashboard");

const navigateTo = (page: string) => {
  router.push({ name: page });
};

watch(
  () => route.name,
  (newName) => {
    activeMenu.value = newName as string;
  },
);

onMounted(() => {
  activeMenu.value = (route.name as string) || "dashboard";
});
</script>

<style scoped>
:deep(.ant-menu-dark) {
  background: transparent;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
  background-color: rgba(99, 102, 241, 0.15) !important;
  color: #a5b4fc !important;
  border-bottom: 2px solid #6366f1;
}

:deep(.ant-menu-dark .ant-menu-item:hover) {
  color: #cbd5e1 !important;
}
</style>
