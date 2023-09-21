<template>
  <div class="search-container">
    <el-card>
      <template #header>
        <div>
          <el-select
            v-model="projectSelect"
            filterable
            placeholder="项目过滤"
            clearable
            @change="handleSearch()"
            style="width: 100px; float: left; margin-right: 10px;"
          >
            <el-option
              v-for="item in projectSelectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            class="search-input"
            v-model="searchData"
            clearable placeholder="请输入搜索内容，支持通配符搜索"
            @keyup.enter="handleSearch()">
            <template #prepend>
              <el-select
                v-model="searchSelect"
                placeholder="高级搜索"
                clearable
                style="width: 100px"
              >
                <el-option
                  v-for="item in searchSelectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
            <template #append>
              <el-button :icon="Search" @click="handleSearch()" :loading="searchLoading"/>
            </template>
          </el-input>
          <el-button v-if="isLogin" type="danger" style="float: right" @click="handleLogout">退出
          </el-button>
          <el-button type="success" style="float: right;margin-right: 10px" @click="handleHelp">帮助</el-button>
          <div v-if="searchTags.length > 0" style="word-wrap: break-word; margin-top: 20px;">
            <el-tag
              style="margin-right: 4px"
              v-for="tag in searchTags"
              :key="tag"
              class="mx-1"
              closable
              round
              :disable-transitions="false"
              @close="handleCloseTag(tag)"
              :type="tag.type"
            >
              {{ tag.name }}: {{ tag.value }}
            </el-tag>
          </div>
        </div>
      </template>
      <div>
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
      </div>
    </el-card>
    <el-drawer
      v-model="isShowHelp"
    >
      <ul>
        <li>搜索说明<br>
          <div v-highlight>
              <pre>
                <code>{{ helpTextMessage }}</code>
              </pre>
          </div>
        </li>
        <li>片段搜索<br>
          <div v-highlight>
              <pre>
                <code>{{ helpTextMatchPhrase }}</code>
              </pre>
          </div>
        </li>
        <li>通配符搜索<br>
          <div v-highlight>
              <pre>
                <code>{{ helpTextWildcard }}</code>
              </pre>
          </div>
        </li>
        <li>模糊搜索<br>
          <div v-highlight>
            <pre><code>{{ helpTextMatch }}</code></pre>
          </div>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>
<script setup>
import { Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { restFull } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'

const searchData = ref('')
const searchCodeContent = ref('')
const searchCodeFileName = ref('')
const searchCodeSuffixName = ref('')
const pathWithNamespace = ref('')
const pageNumber = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const searchProjects = ref([])
const windowHeight = ref('100%')
const currentWindowHeight = ref(0)
const windowWidth = ref('100%')
const currentWindowWidth = ref(0)
const searchWidth = ref('40%')
const tableWidth = ref('40%')
const isLogin = ref(false)
const projectSelect = ref('')
const projectSelectOptions = ref([])
const searchLoading = ref(false)
const searchSelectOptions = ref([
  {
    value: 'code_file_name',
    label: '文件名'
  }, {
    value: 'code_suffix_name',
    label: '文件类型'
  }, {
    value: 'namespace_path',
    label: '项目路径'
  }
])
const searchSelect = ref('')
const searchTags = ref([])
const isShowHelp = ref(false)
const helpTextMessage = ref('默认情况下只搜索代码内容，可以添加其他条件进行搜索\n多个条件是 AND 的关系\n\n代码搜索：支持片段搜索、通配符搜索、模糊搜索\n项目过滤：完全匹配\n项目路径：支持片段搜索、通配符搜索\n文件类型：完全匹配\n文件名：  支持片段搜索、通配符搜索')
const helpTextMatchPhrase = ref('默认模式（使用单引号则强制使用）\n比如 "\'test www\'" 则会搜索 "test www" ')
const helpTextWildcard = ref('搜索中包含 "*|?" 则进行通配符搜索\n比如 "te?t" "www*" ')
const helpTextMatch = ref('搜索中包含空格则进行模糊搜索\n比如 "test www" 则会同时搜索 "test" "www" ')
const handleResize = () => {
  if (window.innerHeight > currentWindowHeight.value) {
    currentWindowHeight.value = window.innerHeight
    windowHeight.value = window.innerHeight - 20 + 'px'
  }
  if (window.innerWidth > currentWindowWidth.value) {
    currentWindowWidth.value = window.innerWidth
    windowWidth.value = window.innerWidth - 20 + 'px'
    tableWidth.value = Math.floor(window.innerWidth * 0.4) + 'px'
    searchWidth.value = Math.floor(window.innerWidth * 0.4 - 100) + 'px'
  }
}

handleResize()

const getProjects = async () => {
  await restFull('/projects', 'GET', {}).then(res => {
    res.projects.forEach(item => {
      projectSelectOptions.value.push({
        value: item.id,
        label: item.path_with_namespace
      })
    })
  })
}

getProjects()

const handleCloseTag = (tag) => {
  searchTags.value.splice(searchTags.value.indexOf(tag), 1)
  switch (tag.name) {
    case '文件名':
      searchCodeFileName.value = ''
      break
    case '文件类型':
      searchCodeSuffixName.value = ''
      break
    case '代码内容':
      searchCodeContent.value = ''
      break
    case '项目名':
      projectSelect.value = ''
      break
    case '项目路径':
      pathWithNamespace.value = ''
      break
  }
  handleSearch(true)
}

let preProjectSelect = ''
const handleAddSearchTag = () => {
  if (projectSelect.value !== '') {
    if (projectSelect.value !== preProjectSelect) {
      preProjectSelect = projectSelect.value
      searchTags.value = searchTags.value.filter(item => item.name !== '项目名')
      searchTags.value.push({
        name: '项目名',
        value: projectSelectOptions.value.find(item => item.value === projectSelect.value).label,
        type: 'success'
      })
    }
  } else {
    searchTags.value = searchTags.value.filter(item => item.name !== '项目名')
  }
  if (searchData.value !== '') {
    switch (searchSelect.value) {
      case 'code_file_name':
        searchCodeFileName.value = searchData.value
        searchTags.value = searchTags.value.filter(item => item.name !== '文件名')
        searchTags.value.push({
          name: '文件名',
          value: searchData.value,
          type: 'success'
        })
        break
      case 'code_suffix_name':
        searchCodeSuffixName.value = searchData.value
        searchTags.value = searchTags.value.filter(item => item.name !== '文件类型')
        searchTags.value.push({
          name: '文件类型',
          value: searchData.value,
          type: 'success'
        })
        break
      case 'namespace_path':
        pathWithNamespace.value = searchData.value
        searchTags.value = searchTags.value.filter(item => item.name !== '项目路径')
        searchTags.value.push({
          name: '项目路径',
          value: searchData.value,
          type: 'success'
        })
        break
      default:
        searchTags.value = searchTags.value.filter(item => item.name !== '代码内容')
        searchTags.value.push({
          name: '代码内容',
          value: searchData.value,
          type: 'success'
        })
        searchCodeContent.value = searchData.value
        break
    }
  }
}
const handleSearch = async (isNoHandleTag = false) => {
  if (isNoHandleTag === false) {
    handleAddSearchTag()
  }
  searchData.value = ''
  searchLoading.value = true
  searchProjects.value = []
  try {
    await restFull('/search', 'GET', {
      id: projectSelect.value,
      path_with_namespace: pathWithNamespace.value,
      code_content: searchCodeContent.value,
      code_file_name: searchCodeFileName.value,
      code_suffix_name: searchCodeSuffixName.value,
      page_number: pageNumber.value,
      page_size: pageSize.value
    })
      .then(res => {
        searchProjects.value = res.projects
        totalCount.value = res.total_count
      })
  } catch (e) {
    console.log(e)
  }
  searchLoading.value = false
}

handleSearch()

const handleSizeChange = currentSize => {
  pageSize.value = currentSize
  handleSearch()
}

const handleCurrentChange = currentPage => {
  pageNumber.value = currentPage
  handleSearch()
}

const handleLogout = () => {
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

const handleHelp = () => {
  isShowHelp.value = !isShowHelp.value
}

// 监听各类事件
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

</script>
<style lang="scss" scoped>
.search-container {
  width: v-bind(windowWidth);
  min-height: v-bind(windowHeight);

  .el-card.is-always-shadow :deep {
    box-shadow: none;
  }

  .el-card :deep {
    --el-card-border-color: none;
  }

  .search-input {
    width: v-bind(searchWidth);
    word-wrap: break-word;
  }

  .search-table {
    width: v-bind(tableWidth);
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
