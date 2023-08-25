import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import router from './router'
import './premission'

const app = createApp(App).use(router)

installElementPlus(app)
app.directive('highlight', function (el) {
  const blocks = el.querySelectorAll('pre code')
  blocks.forEach((block) => {
    hljs.highlightBlock(block)
  })
})

app.config.errorHandler = (err) => {
  console.log(err)
}

app.mount('#app')
