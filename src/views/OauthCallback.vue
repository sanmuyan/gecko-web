<template>
  <div></div>
</template>
<script setup>
import { restFull } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'
import router from '@/router'

const getToken = async () => {
  const query = window.location.search.substring(1)
  const code = query.replace('code=', '').replace('&state=state', '')
  await restFull('/oauth/callback', 'GET', {
    code: code
  }).then(res => {
    if (res) {
      store.dispatch('user/login', res)
      ElMessage.success('登录成功')
      return
    }
    router.push('/')
    ElMessage.error('登录失败')
  })
}

setTimeout(() => {
  getToken()
}, 1000)

</script>
<style scoped lang="scss">
</style>
