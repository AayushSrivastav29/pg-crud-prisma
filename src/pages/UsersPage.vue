<template>
  <div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      "
    >
      <div>
        <h2
          style="
            margin: 0;
            font-family: var(--font-heading);
            font-size: 28px;
            font-weight: 700;
            color: #f1f5f9;
          "
        >
          Users Registry
        </h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px">
          Manage user accounts, view posts volume, and edit details.
        </p>
      </div>
      <a-button
        type="primary"
        size="large"
        @click="showAddModal"
        style="border-radius: 6px"
      >
        <template #icon><PlusOutlined /></template>
        Add User
      </a-button>
    </div>

    <!-- Users Table Card -->
    <a-card class="premium-card" :bordered="false" style="margin-bottom: 24px">
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 8 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'postsCount'">
            <a-tag
              color="purple"
              style="font-weight: 600; padding: 2px 8px; border-radius: 4px"
            >
              {{ record._count?.posts || 0 }} posts
            </a-tag>
          </template>

          <template v-else-if="column.key === 'createdAt'">
            <span style="color: #94a3b8">
              {{ formatDate(record.createdAt) }}
            </span>
          </template>

          <template v-else-if="column.key === 'action'">
            <div style="display: flex; gap: 8px">
              <a-button
                type="link"
                size="small"
                @click="showEditModal(record)"
                style="color: #818cf8; padding: 0"
              >
                <template #icon><EditOutlined /></template>
                Edit
              </a-button>
              <a-popconfirm
                title="Are you sure you want to delete this user? All their posts will also be deleted."
                ok-text="Yes, Delete"
                cancel-text="Cancel"
                @confirm="deleteUser(record.id)"
                ok-button-props="{ danger: true }"
              >
                <a-button type="link" danger size="small" style="padding: 0">
                  <template #icon><DeleteOutlined /></template>
                  Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit User Modal -->
    <a-modal
      v-model:open="modalOpen"
      :title="editingUser ? 'Edit User Details' : 'Create New User'"
      :confirm-loading="submitLoading"
      @ok="handleModalOk"
      @cancel="closeModal"
      ok-text="Save"
      cancel-text="Cancel"
      :body-style="{ paddingTop: '16px' }"
    >
      <a-form
        layout="vertical"
        :model="formState"
        ref="formRef"
        :rules="formRules"
      >
        <a-form-item label="Full Name" name="name">
          <a-input v-model:value="formState.name" placeholder="e.g. John Doe" />
        </a-form-item>
        <a-form-item label="Email Address" name="email">
          <a-input
            v-model:value="formState.email"
            placeholder="e.g. john.doe@example.com"
            :disabled="editingUser !== null"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { message } from "ant-design-vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import api from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
  };
}

const users = ref<User[]>([]);
const loading = ref(false);
const modalOpen = ref(false);
const submitLoading = ref(false);
const editingUser = ref<User | null>(null);
const formRef = ref();

const formState = reactive({
  name: "",
  email: "",
});

const formRules = {
  name: [{ required: true, message: "Please input the name", trigger: "blur" }],
  email: [
    { required: true, message: "Please input the email", trigger: "blur" },
    {
      type: "email",
      message: "Please input a valid email address",
      trigger: "blur",
    },
  ],
};

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 80 },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: User, b: User) => a.name.localeCompare(b.name),
  },
  { title: "Email Address", dataIndex: "email", key: "email" },
  {
    title: "Posts Count",
    key: "postsCount",
    width: 140,
    align: "center" as const,
  },
  { title: "Joined At", key: "createdAt", width: 180 },
  { title: "Actions", key: "action", width: 150 },
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error: any) {
    message.error(
      "Failed to load users: " + (error.response?.data?.error || error.message),
    );
  } finally {
    loading.value = false;
  }
};

const showAddModal = () => {
  editingUser.value = null;
  formState.name = "";
  formState.email = "";
  modalOpen.value = true;
};

const showEditModal = (user: User) => {
  editingUser.value = user;
  formState.name = user.name;
  formState.email = user.email;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleModalOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      submitLoading.value = true;
      try {
        if (editingUser.value) {
          // Edit User
          await api.put(`/users/${editingUser.value.id}`, {
            name: formState.name,
          });
          message.success("User updated successfully");
        } else {
          // Add User
          await api.post("/users", {
            name: formState.name,
            email: formState.email,
          });
          message.success("User created successfully");
        }
        closeModal();
        fetchUsers();
      } catch (error: any) {
        message.error(
          "Operation failed: " + (error.response?.data?.error || error.message),
        );
      } finally {
        submitLoading.value = false;
      }
    })
    .catch(() => {
      // Validation failed
    });
};

const deleteUser = async (id: number) => {
  try {
    await api.delete(`/users/${id}`);
    message.success("User deleted successfully");
    fetchUsers();
  } catch (error: any) {
    message.error(
      "Failed to delete user: " +
        (error.response?.data?.error || error.message),
    );
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  fetchUsers();
});
</script>
