import request from '@/utils/request'

export const restFull = (url, method, data) => {
  if (method === 'GET') {
    return request({
      url: url,
      method: method,
      params: data
    })
  } else {
    return request({
      url: url,
      method: method,
      data
    })
  }
}
