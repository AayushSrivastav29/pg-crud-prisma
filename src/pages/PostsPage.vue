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
          Posts Repository
        </h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px">
          Create articles, link categories and tags, and toggle publication
          status.
        </p>
      </div>
      <a-button
        type="primary"
        size="large"
        @click="showAddModal"
        style="border-radius: 6px"
      >
        <template #icon><PlusOutlined /></template>
        New Post
      </a-button>
    </div>

    <!-- Filter Bar -->
    <a-card
      class="premium-card"
      :bordered="false"
      style="
        margin-bottom: 16px;
        body-style: {
          padding: &quot;16px&quot;;
        }
      "
    >
      <div style="display: flex; gap: 16px; align-items: center">
        <span style="color: #94a3b8; font-size: 14px">Filter Status:</span>
        <a-radio-group
          v-model:value="filterStatus"
          @change="fetchPosts"
          button-style="solid"
        >
          <a-radio-button value="all">All Posts</a-radio-button>
          <a-radio-button value="published">Published</a-radio-button>
          <a-radio-button value="draft">Drafts</a-radio-button>
        </a-radio-group>
      </div>
    </a-card>

    <!-- Posts Table Card -->
    <a-card class="premium-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="posts"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 8 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'author'">
            <span style="font-weight: 500">{{
              record.author?.name || "Unknown"
            }}</span>
          </template>

          <template v-else-if="column.key === 'categories'">
            <div style="display: flex; flex-wrap: wrap; gap: 4px">
              <a-tag
                v-for="cat in record.categories"
                :key="cat.id"
                color="blue"
                style="border-radius: 3px"
              >
                {{ cat.name }}
              </a-tag>
              <span
                v-if="!record.categories?.length"
                style="color: #4b5563; font-style: italic"
                >None</span
              >
            </div>
          </template>

          <template v-else-if="column.key === 'tags'">
            <div style="display: flex; flex-wrap: wrap; gap: 4px">
              <a-tag
                v-for="tag in record.tags"
                :key="tag.id"
                color="cyan"
                style="border-radius: 3px; font-size: 11px"
              >
                #{{ tag.name }}
              </a-tag>
              <span
                v-if="!record.tags?.length"
                style="color: #4b5563; font-style: italic"
                >None</span
              >
            </div>
          </template>

          <template v-else-if="column.key === 'published'">
            <a-switch
              :checked="record.published"
              @change="(checked) => togglePublished(record, checked as boolean)"
              checked-children="LIVE"
              un-checked-children="DRAFT"
              style="background-color: #374151"
              :class="{ 'ant-switch-checked': record.published }"
            />
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
                title="Delete this post permanently?"
                ok-text="Yes, Delete"
                cancel-text="Cancel"
                @confirm="deletePost(record.id)"
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

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:open="modalOpen"
      :title="editingPost ? 'Edit Post' : 'Write New Post'"
      :confirm-loading="submitLoading"
      @ok="handleModalOk"
      @cancel="closeModal"
      ok-text="Save"
      cancel-text="Cancel"
      width="600px"
    >
      <a-form
        layout="vertical"
        :model="formState"
        ref="formRef"
        :rules="formRules"
        style="padding-top: 16px"
      >
        <a-form-item label="Post Title" name="title">
          <a-input
            v-model:value="formState.title"
            placeholder="Enter a descriptive title"
          />
        </a-form-item>

        <a-form-item label="Content" name="content">
          <a-textarea
            v-model:value="formState.content"
            placeholder="Write the body of the post..."
            :rows="5"
          />
        </a-form-item>

        <a-form-item label="Author" name="authorId">
          <a-select
            v-model:value="formState.authorId"
            placeholder="Select an author"
            :disabled="editingPost !== null"
          >
            <a-select-option
              v-for="user in users"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }} ({{ user.email }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Categories" name="categoryIds">
              <a-select
                v-model:value="formState.categoryIds"
                mode="multiple"
                placeholder="Assign categories"
                style="width: 100%"
              >
                <a-select-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Tags" name="tagIds">
              <a-select
                v-model:value="formState.tagIds"
                mode="multiple"
                placeholder="Assign tags"
                style="width: 100%"
              >
                <a-select-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :value="tag.id"
                >
                  #{{ tag.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Publish Immediately" name="published">
          <a-switch v-model:checked="formState.published" />
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
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  createdAt: string;
  author?: User;
  categories?: Category[];
  tags?: Tag[];
}

const posts = ref<Post[]>([]);
const users = ref<User[]>([]);
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

const loading = ref(false);
const filterStatus = ref("all");
const modalOpen = ref(false);
const submitLoading = ref(false);
const editingPost = ref<Post | null>(null);
const formRef = ref();

const formState = reactive({
  title: "",
  content: "",
  authorId: undefined as number | undefined,
  categoryIds: [] as number[],
  tagIds: [] as number[],
  published: false,
});

const formRules = {
  title: [
    { required: true, message: "Please input the post title", trigger: "blur" },
  ],
  authorId: [
    { required: true, message: "Please select an author", trigger: "change" },
  ],
};

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    width: 180,
    ellipsis: true,
  },
  { title: "Author", key: "author", width: 120 },
  { title: "Categories", key: "categories", width: 150 },
  { title: "Tags", key: "tags", width: 150 },
  { title: "Status", key: "published", width: 110, align: "center" as const },
  { title: "Created At", key: "createdAt", width: 120 },
  { title: "Actions", key: "action", width: 120 },
];

const fetchPosts = async () => {
  loading.value = true;
  try {
    let url = "/posts";
    if (filterStatus.value === "published") {
      url += "?published=true";
    } else if (filterStatus.value === "draft") {
      url += "?published=false";
    }
    const response = await api.get(url);
    posts.value = response.data;
  } catch (error: any) {
    message.error(
      "Failed to load posts: " + (error.response?.data?.error || error.message),
    );
  } finally {
    loading.value = false;
  }
};

const fetchRelations = async () => {
  try {
    const [usersRes, catsRes, tagsRes] = await Promise.all([
      api.get("/users"),
      api.get("/posts/categories"),
      api.get("/posts/tags"),
    ]);
    users.value = usersRes.data;
    categories.value = catsRes.data;
    tags.value = tagsRes.data;
  } catch (error: any) {
    console.error("Failed to load relations:", error);
  }
};

const togglePublished = async (post: Post, checked: boolean) => {
  const originalVal = post.published;
  post.published = checked; // optimistic UI
  try {
    await api.put(`/posts/${post.id}`, { published: checked });
    message.success(checked ? "Post published!" : "Post set to draft.");
  } catch (error: any) {
    post.published = originalVal; // revert
    message.error(
      "Failed to update status: " +
        (error.response?.data?.error || error.message),
    );
  }
};

const showAddModal = () => {
  editingPost.value = null;
  formState.title = "";
  formState.content = "";
  formState.authorId = undefined;
  formState.categoryIds = [];
  formState.tagIds = [];
  formState.published = false;
  modalOpen.value = true;
};

const showEditModal = (post: Post) => {
  editingPost.value = post;
  formState.title = post.title;
  formState.content = post.content || "";
  formState.authorId = post.authorId;
  formState.categoryIds = post.categories
    ? post.categories.map((c) => c.id)
    : [];
  formState.tagIds = post.tags ? post.tags.map((t) => t.id) : [];
  formState.published = post.published;
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
        const payload = {
          title: formState.title,
          content: formState.content,
          authorId: formState.authorId,
          categoryIds: formState.categoryIds,
          tagIds: formState.tagIds,
          published: formState.published,
        };

        if (editingPost.value) {
          await api.put(`/posts/${editingPost.value.id}`, payload);
          message.success("Post updated successfully");
        } else {
          await api.post("/posts", payload);
          message.success("Post written successfully");
        }
        closeModal();
        fetchPosts();
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

const deletePost = async (id: number) => {
  try {
    await api.delete(`/posts/${id}`);
    message.success("Post deleted successfully");
    fetchPosts();
  } catch (error: any) {
    message.error(
      "Failed to delete post: " +
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
  fetchPosts();
  fetchRelations();
});
</script>
