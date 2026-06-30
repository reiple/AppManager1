import { useState, Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storageApi, bucketApi } from '../services/storageApi'
import './ObjectStorage.css'

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
  } catch {
    return String(dateStr)
  }
}

// Extract the last path segment from a folder prefix ("images/2026/" → "2026")
function folderName(prefix) {
  const parts = prefix.split('/').filter(Boolean)
  return parts[parts.length - 1] || prefix
}

function getFileIcon(type, ext = '') {
  if (type === 'folder') return '📁'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'].includes(ext)) return '🖼️'
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) return '🎬'
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return '🎵'
  if (['zip', 'tar', 'gz', 'bz2', '7z', 'rar'].includes(ext)) return '📦'
  if (['pdf'].includes(ext)) return '📕'
  if (['json', 'yaml', 'yml', 'xml', 'toml'].includes(ext)) return '📋'
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'java', 'rb', 'php', 'rs'].includes(ext)) return '💻'
  if (['html', 'htm', 'css', 'scss'].includes(ext)) return '🌐'
  if (['md', 'txt', 'log', 'csv'].includes(ext)) return '📝'
  return '📄'
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  if (!toast) return null
  return (
    <div className={`os-toast os-toast-${toast.type}`} role="alert">
      <span>{toast.message}</span>
      <button className="os-toast-close" onClick={onClose}>✕</button>
    </div>
  )
}

// ── AddStorageModal ───────────────────────────────────────────────────────────

function AddStorageModal({ onClose, onSuccess }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '', access_key: '', secret_key: '',
    endpoint_url: '', bucket_name: '', region_name: '',
  })
  const [formError, setFormError] = useState('')

  const mutation = useMutation({
    mutationFn: storageApi.registerStorage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storages'] })
      onSuccess(data)
    },
    onError: (err) => setFormError(err.message),
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    mutation.mutate({
      name: form.name.trim(),
      access_key: form.access_key.trim(),
      secret_key: form.secret_key,
      bucket_name: form.bucket_name.trim(),
      ...(form.endpoint_url.trim() && { endpoint_url: form.endpoint_url.trim() }),
      ...(form.region_name.trim() && { region_name: form.region_name.trim() }),
    })
  }

  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-modal" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header">
          <h3>{t('objectStorage.addStorage')}</h3>
          <button className="os-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="os-modal-body" onSubmit={handleSubmit}>
          {formError && <div className="os-form-error">{formError}</div>}
          <label className="os-form-label">
            {t('objectStorage.form.name')} <span className="os-required">*</span>
            <input className="os-form-input" value={form.name} onChange={set('name')} required placeholder="My MinIO Storage" autoFocus />
          </label>
          <label className="os-form-label">
            {t('objectStorage.form.bucketName')} <span className="os-required">*</span>
            <input className="os-form-input" value={form.bucket_name} onChange={set('bucket_name')} required placeholder="my-bucket" />
          </label>
          <label className="os-form-label">
            {t('objectStorage.form.accessKey')} <span className="os-required">*</span>
            <input className="os-form-input" value={form.access_key} onChange={set('access_key')} required placeholder="AKIAIOSFODNN7EXAMPLE" autoComplete="off" />
          </label>
          <label className="os-form-label">
            {t('objectStorage.form.secretKey')} <span className="os-required">*</span>
            <input className="os-form-input" type="password" value={form.secret_key} onChange={set('secret_key')} required placeholder="••••••••••••••••••" autoComplete="new-password" />
          </label>
          <label className="os-form-label">
            {t('objectStorage.form.endpointUrl')}
            <input className="os-form-input" value={form.endpoint_url} onChange={set('endpoint_url')} placeholder="https://minio.example.com" />
          </label>
          <label className="os-form-label">
            {t('objectStorage.form.regionName')}
            <input className="os-form-input" value={form.region_name} onChange={set('region_name')} placeholder="ap-northeast-2" />
          </label>
          <div className="os-modal-actions">
            <button type="button" className="os-btn-secondary" onClick={onClose} disabled={mutation.isPending}>
              {t('objectStorage.cancel')}
            </button>
            <button type="submit" className="os-btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? t('objectStorage.saving') : t('objectStorage.addStorage')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── CreateBucketModal ─────────────────────────────────────────────────────────

function CreateBucketModal({ storageId, onClose, onSuccess }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', region: '', accessControl: 'private' })
  const [formError, setFormError] = useState('')

  const mutation = useMutation({
    mutationFn: () => bucketApi.create(storageId, form),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['buckets', storageId] })
      onSuccess(data)
    },
    onError: (err) => setFormError(err.message),
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-modal" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header">
          <h3>{t('objectStorage.createBucket')}</h3>
          <button className="os-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="os-modal-body" onSubmit={e => { e.preventDefault(); setFormError(''); mutation.mutate() }}>
          {formError && <div className="os-form-error">{formError}</div>}
          <label className="os-form-label">
            {t('objectStorage.bucketForm.name')} <span className="os-required">*</span>
            <input className="os-form-input" value={form.name} onChange={set('name')} required placeholder="my-new-bucket" autoFocus />
          </label>
          <label className="os-form-label">
            {t('objectStorage.bucketForm.region')} <span className="os-required">*</span>
            <input className="os-form-input" value={form.region} onChange={set('region')} required placeholder="ap-northeast-2" />
          </label>
          <label className="os-form-label">
            {t('objectStorage.bucketForm.accessControl')}
            <select className="os-form-input os-form-select" value={form.accessControl} onChange={set('accessControl')}>
              <option value="private">{t('objectStorage.accessControl.private')}</option>
              <option value="public">{t('objectStorage.accessControl.public')}</option>
            </select>
          </label>
          <div className="os-modal-actions">
            <button type="button" className="os-btn-secondary" onClick={onClose} disabled={mutation.isPending}>
              {t('objectStorage.cancel')}
            </button>
            <button type="submit" className="os-btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? t('objectStorage.saving') : t('objectStorage.createBucket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── UploadModal ───────────────────────────────────────────────────────────────

function UploadModal({ storageId, bucketId, prefix, onClose, onSuccess }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [customKey, setCustomKey] = useState('')
  const [uploadState, setUploadState] = useState('idle') // idle | uploading | done | error
  const [uploadError, setUploadError] = useState('')

  const objectKey = customKey.trim() || (file ? prefix + file.name : '')

  const handleUpload = async () => {
    if (!file || !objectKey) return
    setUploadState('uploading')
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('key', objectKey)
      if (file.type) formData.append('contentType', file.type)
      await bucketApi.uploadObject(storageId, bucketId, formData)
      setUploadState('done')
      setTimeout(onSuccess, 900)
    } catch (err) {
      setUploadError(err.message)
      setUploadState('error')
    }
  }

  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-modal" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header">
          <h3>{t('objectStorage.uploadFile')}</h3>
          <button className="os-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="os-modal-body">
          {uploadError && <div className="os-form-error">{uploadError}</div>}
          <div
            className={`os-file-drop${file ? ' os-file-drop-has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="os-file-input-hidden" onChange={e => { setFile(e.target.files?.[0] || null); setCustomKey(''); setUploadState('idle'); setUploadError('') }} />
            {file ? (
              <div className="os-file-selected">
                <span className="os-file-sel-icon">{getFileIcon('file', file.name.split('.').pop()?.toLowerCase())}</span>
                <div className="os-file-sel-info">
                  <span className="os-file-sel-name">{file.name}</span>
                  <span className="os-file-sel-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ) : (
              <div className="os-file-drop-hint">
                <span className="os-file-drop-icon">📂</span>
                <span>{t('objectStorage.clickToSelect')}</span>
              </div>
            )}
          </div>
          <label className="os-form-label">
            {t('objectStorage.objectKey')}
            <input className="os-form-input os-key-input" value={objectKey} onChange={e => setCustomKey(e.target.value)} placeholder={prefix ? `${prefix}filename.ext` : 'path/to/file.ext'} disabled={!file} />
          </label>
          {uploadState === 'uploading' && <div className="os-progress-bar"><div className="os-progress-fill" /></div>}
          {uploadState === 'done' && <div className="os-upload-success">✓ {t('objectStorage.uploadSuccess')}</div>}
          <div className="os-modal-actions">
            <button className="os-btn-secondary" onClick={onClose} disabled={uploadState === 'uploading'}>{t('objectStorage.cancel')}</button>
            <button className="os-btn-primary" onClick={handleUpload} disabled={!file || uploadState === 'uploading' || uploadState === 'done'}>
              {uploadState === 'uploading' ? t('objectStorage.uploading') : t('objectStorage.upload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────

function DeleteConfirmModal({ target, onConfirm, onClose, isPending }) {
  const { t } = useTranslation()
  const name = target.name || target.key || target.storage_id
  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-modal os-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header">
          <h3>{t('objectStorage.confirmDelete')}</h3>
          <button className="os-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="os-modal-body">
          <p className="os-delete-msg">{t('objectStorage.deleteMsg', { name })}</p>
          <div className="os-modal-actions">
            <button className="os-btn-secondary" onClick={onClose} disabled={isPending}>{t('objectStorage.cancel')}</button>
            <button className="os-btn-danger" onClick={onConfirm} disabled={isPending}>
              {isPending ? t('objectStorage.deleting') : t('objectStorage.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ObjectStorage (main) ──────────────────────────────────────────────────────

export function ObjectStorage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // 3-level navigation state
  const [selectedStorage, setSelectedStorage] = useState(null)  // StorageResponse
  const [selectedBucket, setSelectedBucket] = useState(null)    // BucketSummary
  const [currentPrefix, setCurrentPrefix] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddStorage, setShowAddStorage] = useState(false)
  const [showCreateBucket, setShowCreateBucket] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'storage'|'bucket'|'object', ... }
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  const storagesQuery = useQuery({
    queryKey: ['storages'],
    queryFn: storageApi.listStorages,
    retry: 1,
  })

  const bucketsQuery = useQuery({
    queryKey: ['buckets', selectedStorage?.storage_id],
    queryFn: () => bucketApi.list(selectedStorage.storage_id),
    enabled: !!selectedStorage,
    retry: 1,
  })

  const objectsQuery = useQuery({
    queryKey: ['bucket-objects', selectedBucket?.id, currentPrefix],
    queryFn: () => bucketApi.listObjects(
      selectedStorage.storage_id,
      selectedBucket.id,
      { prefix: currentPrefix }
    ),
    enabled: !!selectedBucket,
    retry: 1,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const deleteStorageMutation = useMutation({
    mutationFn: (storageId) => storageApi.deleteStorage(storageId),
    onSuccess: (_, storageId) => {
      queryClient.invalidateQueries({ queryKey: ['storages'] })
      if (selectedStorage?.storage_id === storageId) {
        setSelectedStorage(null)
        setSelectedBucket(null)
        setCurrentPrefix('')
      }
      setDeleteTarget(null)
      showToast('success', t('objectStorage.toast.deleteStorageSuccess'))
    },
    onError: (err) => { setDeleteTarget(null); showToast('error', err.message) },
  })

  const deleteBucketMutation = useMutation({
    mutationFn: ({ storageId, bucketId }) => bucketApi.remove(storageId, bucketId),
    onSuccess: (_, { bucketId }) => {
      queryClient.invalidateQueries({ queryKey: ['buckets', selectedStorage?.storage_id] })
      if (selectedBucket?.id === bucketId) {
        setSelectedBucket(null)
        setCurrentPrefix('')
      }
      setDeleteTarget(null)
      showToast('success', t('objectStorage.toast.deleteBucketSuccess'))
    },
    onError: (err) => { setDeleteTarget(null); showToast('error', err.message) },
  })

  const deleteObjectMutation = useMutation({
    mutationFn: ({ storageId, objectKey }) => storageApi.deleteObject(storageId, objectKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-objects', selectedBucket?.id] })
      setDeleteTarget(null)
      showToast('success', t('objectStorage.toast.deleteObjectSuccess'))
    },
    onError: (err) => { setDeleteTarget(null); showToast('error', err.message) },
  })

  const downloadMutation = useMutation({
    mutationFn: ({ storageId, objectKey }) =>
      storageApi.createPresignedUrl(storageId, { object_key: objectKey, method: 'get_object', expires_in: 3600 }),
    onSuccess: (data) => {
      window.open(data.url, '_blank', 'noopener,noreferrer')
      showToast('success', t('objectStorage.toast.downloadReady'))
    },
    onError: (err) => showToast('error', err.message),
  })

  // ── Navigation ─────────────────────────────────────────────────────────────

  const selectStorage = (storage) => {
    setSelectedStorage(storage)
    setSelectedBucket(null)
    setCurrentPrefix('')
    setSearchQuery('')
  }

  const selectBucket = (bucket) => {
    setSelectedBucket(bucket)
    setCurrentPrefix('')
    setSearchQuery('')
  }

  const navigateToRoot = () => {
    setSelectedStorage(null)
    setSelectedBucket(null)
    setCurrentPrefix('')
    setSearchQuery('')
  }

  const navigateToStorageRoot = () => {
    setSelectedBucket(null)
    setCurrentPrefix('')
    setSearchQuery('')
  }

  const navigateToBucketRoot = () => {
    setCurrentPrefix('')
    setSearchQuery('')
  }

  const navigateIntoFolder = (prefix) => {
    // prefix is the full path from server e.g. "images/2026/"
    setCurrentPrefix(prefix)
    setSearchQuery('')
  }

  const navigateToPrefixSegment = (idx) => {
    const segments = currentPrefix.split('/').filter(Boolean)
    setCurrentPrefix(segments.slice(0, idx + 1).join('/') + '/')
    setSearchQuery('')
  }

  const goUp = () => {
    if (!selectedStorage) return
    if (!selectedBucket) { setSelectedStorage(null); return }
    if (!currentPrefix) { setSelectedBucket(null); return }
    const segments = currentPrefix.split('/').filter(Boolean)
    setCurrentPrefix(segments.length <= 1 ? '' : segments.slice(0, -1).join('/') + '/')
    setSearchQuery('')
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'storage') {
      deleteStorageMutation.mutate(deleteTarget.storage_id)
    } else if (deleteTarget.type === 'bucket') {
      deleteBucketMutation.mutate({ storageId: deleteTarget.storage_id, bucketId: deleteTarget.id })
    } else if (deleteTarget.type === 'object') {
      deleteObjectMutation.mutate({ storageId: deleteTarget.storage_id, objectKey: deleteTarget.key })
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const isAtHome = !selectedStorage
  const isAtBucketList = !!selectedStorage && !selectedBucket
  const isAtObjects = !!selectedBucket

  const prefixSegments = currentPrefix.split('/').filter(Boolean)
  const isDeletePending = deleteStorageMutation.isPending || deleteBucketMutation.isPending || deleteObjectMutation.isPending

  // Bucket list (with optional search)
  const allBuckets = bucketsQuery.data?.buckets || []
  const filteredBuckets = searchQuery
    ? allBuckets.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allBuckets

  // Object list — server already separates folders and objects
  const { folders = [], objects = [] } = objectsQuery.data || {}
  const filteredFolders = searchQuery
    ? folders.filter(f => folderName(f.prefix).toLowerCase().includes(searchQuery.toLowerCase()))
    : folders
  const filteredObjects = searchQuery
    ? objects.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : objects
  const filteredItems = [...filteredFolders, ...filteredObjects]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="object-storage">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <h2>{t('objectStorage.title')}</h2>
        <p>{t('objectStorage.subtitle')}</p>
      </div>

      <div className="os-layout">

        {/* ── Left: storage tree panel ── */}
        <div className="os-tree-panel">
          <div className="os-tree-header-row">
            <span>{t('objectStorage.storages')}</span>
            <button className="os-tree-add-btn" onClick={() => setShowAddStorage(true)} title={t('objectStorage.addStorage')}>＋</button>
          </div>
          <div className="os-tree-body">
            <button className={`os-tree-item${isAtHome ? ' active' : ''}`} onClick={navigateToRoot}>
              <span className="os-tree-icon">🏠</span>
              <span className="os-tree-label">{t('objectStorage.home')}</span>
            </button>

            {storagesQuery.isLoading && <div className="os-tree-status">{t('objectStorage.loading')}</div>}
            {storagesQuery.isError && <div className="os-tree-status os-tree-error-text">{t('objectStorage.error.loadFailed')}</div>}

            {(storagesQuery.data || []).map(storage => (
              <div
                key={storage.storage_id}
                className={`os-tree-storage-item${selectedStorage?.storage_id === storage.storage_id ? ' active' : ''}`}
              >
                <button className="os-tree-storage-btn" onClick={() => selectStorage(storage)}>
                  <span className="os-tree-icon">🗄️</span>
                  <span className="os-tree-storage-info">
                    <span className="os-tree-storage-name">{storage.name}</span>
                    <span className="os-tree-storage-bucket">{storage.bucket_name}</span>
                  </span>
                </button>
                <button
                  className="os-tree-del-btn"
                  onClick={() => setDeleteTarget({ type: 'storage', ...storage })}
                  title={t('objectStorage.deleteStorage')}
                >✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: main panel ── */}
        <div className="os-main-panel">

          {/* Toolbar */}
          <div className="os-toolbar">
            <nav className="os-breadcrumb" aria-label="breadcrumb">
              <button
                className={`os-breadcrumb-item${isAtHome ? ' current' : ''}`}
                onClick={isAtHome ? undefined : navigateToRoot}
              >
                {t('objectStorage.home')}
              </button>

              {selectedStorage && (
                <>
                  <span className="os-breadcrumb-sep">›</span>
                  <button
                    className={`os-breadcrumb-item${isAtBucketList ? ' current' : ''}`}
                    onClick={isAtBucketList ? undefined : navigateToStorageRoot}
                  >
                    {selectedStorage.name}
                  </button>
                </>
              )}

              {selectedBucket && (
                <>
                  <span className="os-breadcrumb-sep">›</span>
                  <button
                    className={`os-breadcrumb-item${!currentPrefix ? ' current' : ''}`}
                    onClick={currentPrefix ? navigateToBucketRoot : undefined}
                  >
                    {selectedBucket.name}
                  </button>
                </>
              )}

              {prefixSegments.map((seg, idx) => (
                <Fragment key={idx}>
                  <span className="os-breadcrumb-sep">›</span>
                  <button
                    className={`os-breadcrumb-item${idx === prefixSegments.length - 1 ? ' current' : ''}`}
                    onClick={idx < prefixSegments.length - 1 ? () => navigateToPrefixSegment(idx) : undefined}
                  >
                    {seg}
                  </button>
                </Fragment>
              ))}
            </nav>

            <div className="os-toolbar-right">
              <input
                type="text"
                className="os-search"
                placeholder={t('objectStorage.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {isAtBucketList && (
                <button className="os-btn-upload" onClick={() => setShowCreateBucket(true)}>
                  + {t('objectStorage.createBucket')}
                </button>
              )}
              {isAtObjects && (
                <button className="os-btn-upload" onClick={() => setShowUpload(true)}>
                  ⬆ {t('objectStorage.upload')}
                </button>
              )}
              <button className="os-btn-up" onClick={goUp} disabled={isAtHome} title={t('objectStorage.goUp')}>
                ↑ {t('objectStorage.goUp')}
              </button>
            </div>
          </div>

          {/* File list */}
          <div className="os-file-list">

            {/* Level 1: Storage list */}
            {isAtHome && (
              storagesQuery.isLoading ? (
                <div className="os-loading"><div className="os-spinner" /><span>{t('objectStorage.loading')}</span></div>
              ) : storagesQuery.isError ? (
                <div className="os-state-block">
                  <div className="os-state-icon">⚠️</div>
                  <div className="os-state-text">{t('objectStorage.error.loadFailed')}</div>
                  <button className="os-btn-secondary" onClick={() => storagesQuery.refetch()}>{t('objectStorage.retry')}</button>
                </div>
              ) : (storagesQuery.data || []).length === 0 ? (
                <div className="os-empty">
                  <div className="os-empty-icon">📭</div>
                  <div className="os-empty-text">{t('objectStorage.noStorages')}</div>
                  <button className="os-btn-primary os-btn-empty-cta" onClick={() => setShowAddStorage(true)}>+ {t('objectStorage.addStorage')}</button>
                </div>
              ) : (
                <table className="os-table">
                  <thead>
                    <tr>
                      <th>{t('objectStorage.name')}</th>
                      <th>{t('objectStorage.storageTable.bucket')}</th>
                      <th>{t('objectStorage.storageTable.region')}</th>
                      <th>{t('objectStorage.storageTable.endpoint')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(storagesQuery.data || []).map(storage => (
                      <tr key={storage.storage_id} className="row-navigable" onClick={() => selectStorage(storage)}>
                        <td>
                          <div className="os-file-name">
                            <span className="os-file-icon">🗄️</span>
                            <span className="os-file-name-text folder-name">{storage.name}</span>
                          </div>
                        </td>
                        <td><span className="os-size">{storage.bucket_name}</span></td>
                        <td><span className="os-size">{storage.region_name || '-'}</span></td>
                        <td><span className="os-size os-endpoint-text">{storage.endpoint_url || 'AWS S3'}</span></td>
                        <td className="os-actions-cell" onClick={e => e.stopPropagation()}>
                          <div className="os-row-actions">
                            <button className="os-action-btn os-action-btn-danger" onClick={() => setDeleteTarget({ type: 'storage', ...storage })}>
                              {t('objectStorage.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Level 2: Bucket list */}
            {isAtBucketList && (
              bucketsQuery.isLoading ? (
                <div className="os-loading"><div className="os-spinner" /><span>{t('objectStorage.loading')}</span></div>
              ) : bucketsQuery.isError ? (
                <div className="os-state-block">
                  <div className="os-state-icon">⚠️</div>
                  <div className="os-state-text">{t('objectStorage.error.loadFailed')}</div>
                  <button className="os-btn-secondary" onClick={() => bucketsQuery.refetch()}>{t('objectStorage.retry')}</button>
                </div>
              ) : filteredBuckets.length === 0 ? (
                <div className="os-empty">
                  <div className="os-empty-icon">{searchQuery ? '🔍' : '🪣'}</div>
                  <div className="os-empty-text">
                    {searchQuery ? t('objectStorage.noResults') : t('objectStorage.noBuckets')}
                  </div>
                  {!searchQuery && (
                    <button className="os-btn-primary os-btn-empty-cta" onClick={() => setShowCreateBucket(true)}>
                      + {t('objectStorage.createBucket')}
                    </button>
                  )}
                </div>
              ) : (
                <table className="os-table">
                  <thead>
                    <tr>
                      <th>{t('objectStorage.name')}</th>
                      <th>{t('objectStorage.bucketTable.region')}</th>
                      <th>{t('objectStorage.bucketTable.accessControl')}</th>
                      <th>{t('objectStorage.bucketTable.objects')}</th>
                      <th>{t('objectStorage.bucketTable.totalSize')}</th>
                      <th>{t('objectStorage.bucketTable.createdAt')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuckets.map(bucket => (
                      <tr key={bucket.id} className="row-navigable" onClick={() => selectBucket(bucket)}>
                        <td>
                          <div className="os-file-name">
                            <span className="os-file-icon">🪣</span>
                            <span className="os-file-name-text folder-name">{bucket.name}</span>
                          </div>
                        </td>
                        <td><span className="os-size">{bucket.region}</span></td>
                        <td>
                          <span className={`os-acl-badge os-acl-${bucket.accessControl}`}>
                            {t(`objectStorage.accessControl.${bucket.accessControl}`)}
                          </span>
                        </td>
                        <td><span className="os-size">{bucket.objectCount.toLocaleString()}</span></td>
                        <td><span className="os-size">{bucket.totalSizeReadable}</span></td>
                        <td><span className="os-date">{formatDate(bucket.createdAt)}</span></td>
                        <td className="os-actions-cell" onClick={e => e.stopPropagation()}>
                          <div className="os-row-actions">
                            <button
                              className="os-action-btn os-action-btn-danger"
                              onClick={() => setDeleteTarget({ type: 'bucket', storage_id: selectedStorage.storage_id, ...bucket })}
                            >
                              {t('objectStorage.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Level 3: Object list */}
            {isAtObjects && (
              objectsQuery.isLoading ? (
                <div className="os-loading"><div className="os-spinner" /><span>{t('objectStorage.loadingObjects')}</span></div>
              ) : objectsQuery.isError ? (
                <div className="os-state-block">
                  <div className="os-state-icon">⚠️</div>
                  <div className="os-state-text">{t('objectStorage.error.loadFailed')}</div>
                  <button className="os-btn-secondary" onClick={() => objectsQuery.refetch()}>{t('objectStorage.retry')}</button>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="os-empty">
                  <div className="os-empty-icon">{searchQuery ? '🔍' : '📭'}</div>
                  <div className="os-empty-text">
                    {searchQuery ? t('objectStorage.noResults') : t('objectStorage.empty')}
                  </div>
                </div>
              ) : (
                <table className="os-table">
                  <thead>
                    <tr>
                      <th>{t('objectStorage.name')}</th>
                      <th>{t('objectStorage.size')}</th>
                      <th>{t('objectStorage.modified')}</th>
                      <th>{t('objectStorage.type')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => {
                      const isFolder = item.type === 'folder'
                      const displayName = isFolder ? folderName(item.prefix) : item.name
                      const ext = isFolder ? '' : (item.extension || '')
                      return (
                        <tr
                          key={idx}
                          onClick={() => isFolder ? navigateIntoFolder(item.prefix) : undefined}
                          className={isFolder ? 'row-navigable' : ''}
                        >
                          <td>
                            <div className="os-file-name">
                              <span className="os-file-icon">{getFileIcon(item.type, ext)}</span>
                              <span className={`os-file-name-text${isFolder ? ' folder-name' : ''}`}>
                                {displayName}
                              </span>
                            </div>
                          </td>
                          <td><span className="os-size">{isFolder ? '-' : item.sizeReadable}</span></td>
                          <td><span className="os-date">{isFolder ? '-' : formatDate(item.lastModified)}</span></td>
                          <td>
                            <span className={`os-type-badge os-type-${isFolder ? 'folder' : 'file'}`}>
                              {isFolder ? t('objectStorage.folder') : ext.toUpperCase() || 'FILE'}
                            </span>
                          </td>
                          <td className="os-actions-cell" onClick={e => e.stopPropagation()}>
                            {!isFolder && (
                              <div className="os-row-actions">
                                <button
                                  className="os-action-btn"
                                  disabled={downloadMutation.isPending}
                                  onClick={() => downloadMutation.mutate({ storageId: selectedStorage.storage_id, objectKey: item.key })}
                                >
                                  {t('objectStorage.download')}
                                </button>
                                <button
                                  className="os-action-btn os-action-btn-danger"
                                  onClick={() => setDeleteTarget({ type: 'object', storage_id: selectedStorage.storage_id, key: item.key, name: item.name })}
                                >
                                  {t('objectStorage.delete')}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddStorage && (
        <AddStorageModal
          onClose={() => setShowAddStorage(false)}
          onSuccess={(storage) => { setShowAddStorage(false); showToast('success', t('objectStorage.toast.addStorageSuccess')); selectStorage(storage) }}
        />
      )}

      {showCreateBucket && selectedStorage && (
        <CreateBucketModal
          storageId={selectedStorage.storage_id}
          onClose={() => setShowCreateBucket(false)}
          onSuccess={(bucket) => { setShowCreateBucket(false); showToast('success', t('objectStorage.toast.createBucketSuccess')); selectBucket(bucket) }}
        />
      )}

      {showUpload && selectedStorage && selectedBucket && (
        <UploadModal
          storageId={selectedStorage.storage_id}
          bucketId={selectedBucket.id}
          prefix={currentPrefix}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            queryClient.invalidateQueries({ queryKey: ['bucket-objects', selectedBucket.id] })
            showToast('success', t('objectStorage.toast.uploadSuccess'))
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          isPending={isDeletePending}
        />
      )}
    </div>
  )
}
