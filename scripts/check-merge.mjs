import assert from 'node:assert/strict'
import { createEmptyResume } from '../dist/domain/index.js'
import { mergeResume, mergeResumePreferLocal } from '../dist/client/merge.js'
import { createMemoryResumeStore } from '../dist/store/memory.js'
import { saveDocument } from '../dist/tools/shared/runtime.js'

const base = createEmptyResume()
const local = structuredClone(base)
const remote = structuredClone(base)
local.basics.name = '本地姓名'
remote.basics.phone = '13800000000'
let result = mergeResume(base, local, remote)
assert.equal(result.conflicts.length, 0)
assert.equal(result.document.basics.name, '本地姓名')
assert.equal(result.document.basics.phone, '13800000000')

remote.basics.name = '远端姓名'
result = mergeResume(base, local, remote)
assert.deepEqual(result.conflicts.map((item) => item.path), ['basics.name'])
assert.equal(result.document.basics.name, '远端姓名')
result = mergeResume(base, local, remote, { 'basics.name': 'local' })
assert.equal(result.document.basics.name, '本地姓名')
assert.equal(result.document.basics.phone, '13800000000')
result.document = mergeResumePreferLocal(base, local, remote)
assert.equal(result.document.basics.name, '本地姓名')
assert.equal(result.document.basics.phone, '13800000000')

const withItem = createEmptyResume()
withItem.experiences.push({ id: 'a', organization: '原公司', position: '工程师', location: '', startDate: '', endDate: '', summary: '', url: '', highlights: [], keywords: [] })
const localItem = structuredClone(withItem)
const remoteItem = structuredClone(withItem)
localItem.experiences[0].position = '高级工程师'
remoteItem.experiences[0].organization = '新公司'
result = mergeResume(withItem, localItem, remoteItem)
assert.equal(result.conflicts.length, 0)
assert.equal(result.document.experiences[0].position, '高级工程师')
assert.equal(result.document.experiences[0].organization, '新公司')

const store = createMemoryResumeStore()
const aiBase = await store.get('ai-session')
const aiEdit = structuredClone(aiBase)
aiEdit.basics.name = 'AI 修改'
const userEdit = structuredClone(aiBase)
userEdit.basics.name = '用户先保存'
userEdit.basics.phone = '13900000000'
await store.put('ai-session', userEdit)
await saveDocument(store, 'ai-session', aiBase, aiEdit)
const latest = await store.get('ai-session')
assert.equal(latest.basics.name, 'AI 修改')
assert.equal(latest.basics.phone, '13900000000')
console.log('merge checks passed')
