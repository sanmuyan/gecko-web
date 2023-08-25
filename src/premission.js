import router from '@/router'
router.afterEach(r => {
  document.title = r.meta.title || '代码搜索'
})
