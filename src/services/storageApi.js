import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

function extractError(err) {
  const data = err.response?.data
  if (!data) return err.message || '요청에 실패했습니다.'
  if (Array.isArray(data.detail)) return data.detail.map(d => d.msg).join(', ')
  if (typeof data.detail === 'string') return data.detail
  return data.message || '요청에 실패했습니다.'
}

function call(promise) {
  return promise.then(r => r.data).catch(err => {
    throw new Error(extractError(err))
  })
}

export const storageApi = {
  listStorages: () =>
    call(api.get('/storages')),

  registerStorage: (data) =>
    call(api.post('/storages', data)),

  deleteStorage: (storageId) =>
    call(api.delete(`/storages/${storageId}`)),

  testConnection: (storageId) =>
    call(api.post(`/storages/${storageId}/test`)),

  // object_key can contain slashes (path parameter)
  deleteObject: (storageId, objectKey) =>
    call(api.delete(`/storages/${storageId}/objects/${objectKey}`)),

  createPresignedUrl: (storageId, data) =>
    call(api.post(`/storages/${storageId}/presigned-url`, data)),
}

// Bucket API — Authorization: Bearer {storage_id} identifies which storage to use
function bearerHeader(storageId) {
  return { Authorization: `Bearer ${storageId}` }
}

export const bucketApi = {
  list: (storageId, params = {}) =>
    call(api.get('/api/v1/buckets', {
      headers: bearerHeader(storageId),
      params,
    })),

  create: (storageId, data) =>
    call(api.post('/api/v1/buckets', data, {
      headers: bearerHeader(storageId),
    })),

  remove: (storageId, bucketId) =>
    call(api.delete(`/api/v1/buckets/${bucketId}`, {
      headers: bearerHeader(storageId),
    })),

  listObjects: (storageId, bucketId, params = {}) =>
    call(api.get(`/api/v1/buckets/${bucketId}/objects`, {
      headers: bearerHeader(storageId),
      params,
    })),

  // Direct multipart upload — no presigned URL needed
  uploadObject: (storageId, bucketId, formData) =>
    call(api.post(`/api/v1/buckets/${bucketId}/objects`, formData, {
      headers: bearerHeader(storageId),
      // axios sets Content-Type: multipart/form-data with boundary automatically
    })),
}
