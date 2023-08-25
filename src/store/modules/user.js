import { getItem, setItem } from '@/utils/storage'
import { TOKEN_KEY } from '@/constant'
import router from '@/router'

export default {
  namespaced: true,
  state: () => ({
    token: getItem(TOKEN_KEY) || ''
  }),
  mutations: {
    setToken (state, token) {
      state.token = token
      setItem(TOKEN_KEY, token)
    }
  },
  actions: {
    login (context, token) {
      this.commit('user/setToken', token)
      router.push('/').then()
    },
    logout () {
      this.commit('user/setToken', '')
    }
  }
}
