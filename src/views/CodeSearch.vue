<template>
  <el-card class="search-container">
    <template #header>
      <el-input
        v-model="searchData"
        clearable placeholder="请输入代码关键字"
        class="search-input"
        @keyup.enter="handleSearch">
        <template #prepend>
          <el-button :icon="Search" @click="handleSearch" :loading="searchLoading"/>
        </template>
        <template #append>
          <el-select
            v-model="namespacePathSelect"
            filterable
            placeholder="项目过滤"
            style="width: 100px"
          >
            <el-option
              v-for="item in namespacePathSelectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-input>
      <el-button v-if="isLogin" type="danger" style="float: right" @click="handelLogout">退出</el-button>
    </template>
    <el-table :data="searchProjects" class="search-table">
      <el-table-column prop="path_with_namespace" label="项目" width="260" show-overflow-tooltip/>
      <el-table-column prop="code_content" label="代码" type="expand" width="120">
        <template #default="{ row }">
          <a
            :href="row.http_url_to_repo.replace('.git','') + '/blob/master/' + row.code_file_name"
            target="_blank"
            class="file-name"
          >
            {{ row.code_file_name }}
          </a>
          <div v-highlight>
              <pre>
                <code>{{ row.code_content }}</code>
              </pre>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="code_suffix_name" label="类型" width="120"/>
      <el-table-column prop="http_url_to_repo" label="仓库地址" show-overflow-tooltip>
        <template #default="{ row }">
          <a :href="row.http_url_to_repo" target="_blank">{{ row.http_url_to_repo }}</a>
        </template>
      </el-table-column>
    </el-table>
    <!--      分页器-->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[10, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
    ></el-pagination>
  </el-card>
</template>
<script setup>
import { Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { restFull } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'

const searchData = ref('')
const pageNumber = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const searchProjects = ref([])
const windowHeight = ref('100%')
const currentWindowHeight = ref(0)
const windowWidth = ref('100%')
const currentWindowWidth = ref(0)
const searchWidth = ref('40%')
const isLogin = ref(false)
const namespacePathSelect = ref('')
const namespacePathSelectOptions = ref([{
  value: '',
  label: '全部项目'
}])
const searchLoading = ref(false)

const handleResize = () => {
  if (window.innerHeight > currentWindowHeight.value) {
    currentWindowHeight.value = window.innerHeight
    windowHeight.value = window.innerHeight - 20 + 'px'
  }
  if (window.innerWidth > currentWindowWidth.value) {
    currentWindowWidth.value = window.innerWidth
    windowWidth.value = window.innerWidth - 20 + 'px'
    searchWidth.value = Math.floor(window.innerWidth * 0.4) + 'px'
  }
}

handleResize()

const getProjects = async () => {
  await restFull('/projects', 'GET', {}).then(res => {
    res.projects.forEach(item => {
      namespacePathSelectOptions.value.push({
        value: item.path_with_namespace,
        label: item.path_with_namespace
      })
    })
  })
}

getProjects()
const handleSearch = async () => {
  if (!searchData.value || searchData.value.length > 256) {
    ElMessage.error('搜索长度为1-256个字符')
    return
  }
  searchLoading.value = true
  searchProjects.value = []
  await restFull('/search', 'GET', {
    content: searchData.value,
    namespace_path: namespacePathSelect.value,
    page_number: pageNumber.value,
    page_size: pageSize.value
  }).then(res => {
    searchProjects.value = res.projects
    totalCount.value = res.total_count
  })
  searchLoading.value = false
}

const handleSizeChange = currentSize => {
  pageSize.value = currentSize
  handleSearch()
}

const handleCurrentChange = currentPage => {
  pageNumber.value = currentPage
  handleSearch()
}

const handelLogout = () => {
  store.dispatch('user/logout')
  ElMessage.success('已经退出')
  isLogin.value = false
}

const handelIsLogin = () => {
  if (store.getters.token) {
    isLogin.value = true
  }
}

handelIsLogin()

// 监听各类事件
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

</script>
<style lang="scss" scoped>
.search-container {
  width: v-bind(windowWidth);
  min-height: v-bind(windowHeight);
  max-height: v-bind(windowHeight);

  .search-input {
    width: v-bind(searchWidth);
  }

  .search-table {
    width: v-bind(searchWidth);
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }

  .file-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
