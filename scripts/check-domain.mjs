import assert from 'node:assert/strict'
import {
  applyPreset,
  createEmptyResume,
  parseResume,
  removeEntry,
  reorderEntries,
  ResumeDomainError,
  setAppearance,
  setInterests,
  setProfile,
  upsertEntry,
} from '../dist/domain/index.js'

const empty = createEmptyResume()
assert.equal(empty.basics.name, '')
assert.equal(empty.experiences.length, 0)
assert.equal(empty.appearance.presetId, 'classic-serif')

const profile = setProfile(empty, {
  name: 'Ada Lovelace',
  headline: 'Analyst',
  summary: 'Notes on computation',
  workType: '全职',
})
assert.equal(profile.basics.name, 'Ada Lovelace')
assert.equal(empty.basics.name, '', 'setProfile must not mutate the input')

const withJob = upsertEntry(profile, 'experiences', {
  organization: 'Analytical Engine Co.',
  position: 'Analyst',
  startDate: '1842',
  endDate: '1843',
  highlights: ['Wrote the first algorithm'],
})
assert.equal(withJob.experiences.length, 1)
const entryId = withJob.experiences[0].id
assert.ok(entryId)

const updated = upsertEntry(withJob, 'experiences', {
  id: entryId,
  highlights: ['Wrote the first algorithm', 'Collaborated with Babbage'],
})
assert.equal(updated.experiences.length, 1)
assert.equal(updated.experiences[0].position, 'Analyst')
assert.equal(updated.experiences[0].highlights.length, 2)

const withEdu = upsertEntry(updated, 'education', {
  id: 'edu_1',
  school: 'Home study',
  degree: 'Mathematics',
})
const reordered = reorderEntries(withEdu, 'education', ['edu_1'])
assert.deepEqual(reordered.education.map((item) => item.id), ['edu_1'])

const removed = removeEntry(reordered, 'education', 'edu_1')
assert.equal(removed.education.length, 0)

const interests = setInterests(removed, ['notation'])
assert.deepEqual(interests.interests, ['notation'])

const styled = setAppearance(interests, { font: 'sans' })
assert.equal(styled.appearance.font, 'sans')
assert.equal(styled.appearance.presetId, 'custom')

const preset = applyPreset(styled, 'magazine')
assert.equal(preset.appearance.presetId, 'magazine')
assert.equal(preset.appearance.font, 'serif')

assert.deepEqual(parseResume(preset), preset)

assert.throws(() => removeEntry(removed, 'experiences', 'missing'), (error) => {
  assert.ok(error instanceof ResumeDomainError)
  return true
})

assert.throws(() => setAppearance(preset, { accent: '#ff00ff' }), (error) => {
  assert.ok(error instanceof ResumeDomainError)
  return true
})

console.log('domain checks passed')
