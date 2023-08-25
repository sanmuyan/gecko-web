<template>
  <div></div>
</template>
<script setup>

import { restFull } from '@/api'

const handelLogin = async () => {
  await restFull('/login', 'GET').then(res => {
    window.location.replace(res)
  })
}

setTimeout(() => {
  handelLogin()
}, 1000)

</script>

<style scoped lang="scss">

</style>
