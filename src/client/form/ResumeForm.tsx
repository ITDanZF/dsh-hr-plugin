import { Button, Checkbox, Collapse, message, Upload } from 'antd'
import { useState, type ReactNode } from 'react'
import {
  emptyActivity,
  emptyAward,
  emptyCertificate,
  emptyEducation,
  emptyExperience,
  filled,
  emptyLanguage,
  emptyLink,
  emptyProject,
  emptyPublication,
  emptyReference,
  emptySkill,
  removeById,
  updateById,
  type ResumeDraft,
  type SkillLevel,
  type WorkType,
} from '../draft.js'
import type { ResumeCatalog } from '../../domain/index.js'
import { AreaField, ChoiceField, LinesField, MonthField, TextField, TokensField } from './fields.js'

const sections = [
  ['basics', '基本信息'],
  ['intention', '求职意向'],
  ['summary', '摘要'],
  ['experience', '工作与实习'],
  ['projects', '项目'],
  ['education', '教育'],
  ['skills', '技能'],
  ['languages', '语言'],
  ['certificates', '证书'],
  ['awards', '荣誉'],
  ['activities', '校园志愿'],
  ['interests', '兴趣'],
  ['publications', '发表与专利'],
  ['references', '推荐人'],
] as const

type SectionId = (typeof sections)[number][0]

function countLabel(count: number): string {
  return count > 0 ? `${count} 条` : '未填'
}

function sectionStatus(draft: ResumeDraft, id: SectionId): string {
  switch (id) {
    case 'basics':
      return filled(
        draft.basics.name,
        draft.basics.headline,
        draft.basics.phone,
        draft.basics.email,
        draft.basics.location,
        draft.basics.photo,
      ) || draft.basics.links.length > 0
        ? '已填'
        : '未填'
    case 'intention':
      return filled(draft.intention.role, draft.intention.industry, draft.intention.cities, draft.intention.workType)
        ? '已填'
        : '未填'
    case 'summary':
      return draft.summary.trim() ? '已填' : '未填'
    case 'experience':
      return countLabel(draft.experiences.length)
    case 'projects':
      return countLabel(draft.projects.length)
    case 'education':
      return countLabel(draft.education.length)
    case 'skills':
      return countLabel(draft.skills.length)
    case 'languages':
      return countLabel(draft.languages.length)
    case 'certificates':
      return countLabel(draft.certificates.length)
    case 'awards':
      return countLabel(draft.awards.length)
    case 'activities':
      return countLabel(draft.activities.length)
    case 'interests':
      return countLabel(draft.interests.filter((item) => item.trim()).length)
    case 'publications':
      return countLabel(draft.publications.length)
    case 'references':
      if (draft.references.length > 0) return countLabel(draft.references.length)
      return draft.referencesOnRequest ? '备索' : '未填'
  }
}

export function ResumeForm({
  draft,
  catalog,
  onChange,
}: {
  draft: ResumeDraft
  catalog: ResumeCatalog
  onChange: (draft: ResumeDraft) => void
}): ReactNode {
  const set = (next: ResumeDraft) => onChange(next)
  const [active, setActive] = useState<SectionId | null>(null)

  return (
    <div className="editor">
      <Collapse
        accordion
        destroyOnHidden
        expandIconPosition="end"
        className="section-accordion"
        activeKey={active ?? undefined}
        onChange={(key) => {
          const next = Array.isArray(key) ? key[0] : key
          setActive(next ? next as SectionId : null)
        }}
        items={sections.map(([id, label]) => ({
          key: id,
          label,
          extra: (
            <span className={sectionStatus(draft, id) === '未填' ? 'section-pill is-empty' : 'section-pill'}>
              {sectionStatus(draft, id)}
            </span>
          ),
          children: <SectionBody id={id} draft={draft} catalog={catalog} onChange={onChange} />,
        }))}
      />
    </div>
  )
}

function SectionBody({
  id,
  draft,
  catalog,
  onChange,
}: {
  id: SectionId
  draft: ResumeDraft
  catalog: ResumeCatalog
  onChange: (draft: ResumeDraft) => void
}): ReactNode {
  const set = (next: ResumeDraft) => onChange(next)
  if (id === 'basics') return (
        <section className="section-body" id="sec-basics">
          <div className="photo-row">
            {draft.basics.photo
              ? <img src={draft.basics.photo} alt="证件照预览" />
              : <div className="photo-empty">无照片</div>}
            <div>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!file.type.startsWith('image/')) {
                    void message.error('请选择图片文件')
                    return false
                  }
                  if (file.size > 1_000_000) {
                    void message.error('照片请控制在 1 MB 以内')
                    return false
                  }
                  const reader = new FileReader()
                  reader.onload = () => {
                    const photo = typeof reader.result === 'string' ? reader.result : ''
                    set({ ...draft, basics: { ...draft.basics, photo } })
                  }
                  reader.onerror = () => { void message.error('照片读取失败，请重试') }
                  reader.readAsDataURL(file)
                  return false
                }}
              >
                <Button>选择照片</Button>
              </Upload>
              {draft.basics.photo
                ? (
                  <Button
                    type="link"
                    onClick={() => set({ ...draft, basics: { ...draft.basics, photo: '' } })}
                  >
                    移除照片
                  </Button>
                )
                : <p className="hint">照片保存在本机会话中，请选择 1 MB 以内的图片。</p>}
            </div>
          </div>
          <div className="fields" style={{ marginTop: 12 }}>
            <TextField label="姓名" value={draft.basics.name} onChange={(name) => set({ ...draft, basics: { ...draft.basics, name } })} />
            <TextField label="一句话头衔" value={draft.basics.headline} onChange={(headline) => set({ ...draft, basics: { ...draft.basics, headline } })} />
            <TextField label="手机" value={draft.basics.phone} onChange={(phone) => set({ ...draft, basics: { ...draft.basics, phone } })} />
            <TextField label="邮箱" value={draft.basics.email} onChange={(email) => set({ ...draft, basics: { ...draft.basics, email } })} />
            <TextField label="现居城市" value={draft.basics.location} onChange={(location) => set({ ...draft, basics: { ...draft.basics, location } })} />
          </div>
          <ItemList
            title="个人链接"
            onAdd={() => set({ ...draft, basics: { ...draft.basics, links: [...draft.basics.links, emptyLink()] } })}
          >
            {draft.basics.links.map((link, index) => (
              <Item
                key={link.id}
                index={index}
                onRemove={() => set({
                  ...draft,
                  basics: { ...draft.basics, links: removeById(draft.basics.links, link.id) },
                })}
              >
                <div className="fields">
                  <TextField label="平台" value={link.network} onChange={(network) => set({ ...draft, basics: { ...draft.basics, links: updateById(draft.basics.links, link.id, { network }) } })} />
                  <TextField label="账号" value={link.username} onChange={(username) => set({ ...draft, basics: { ...draft.basics, links: updateById(draft.basics.links, link.id, { username }) } })} />
                  <TextField label="网址" wide value={link.url} onChange={(url) => set({ ...draft, basics: { ...draft.basics, links: updateById(draft.basics.links, link.id, { url }) } })} />
                </div>
              </Item>
            ))}
          </ItemList>
        </section>
  )
  if (id === 'intention') return (
        <section className="section-body" id="sec-intention">
          <div className="fields">
            <TextField label="目标岗位" value={draft.intention.role} onChange={(role) => set({ ...draft, intention: { ...draft.intention, role } })} />
            <TextField label="期望行业" value={draft.intention.industry} onChange={(industry) => set({ ...draft, intention: { ...draft.intention, industry } })} />
            <TextField label="期望城市" value={draft.intention.cities} onChange={(cities) => set({ ...draft, intention: { ...draft.intention, cities } })} placeholder="多个城市用顿号分隔" />
            <ChoiceField
              label="工作性质"
              value={draft.intention.workType}
              options={catalog.workType}
              onChange={(workType) => set({ ...draft, intention: { ...draft.intention, workType: workType as WorkType } })}
            />
          </div>
        </section>
  )
  if (id === 'summary') return (
        <section className="section-body" id="sec-summary">
          <div className="fields">
            <AreaField label="摘要" value={draft.summary} onChange={(summary) => set({ ...draft, summary })} placeholder="两到三句，说明匹配点" />
          </div>
        </section>
  )
  if (id === 'experience') return (
        <RepeatSection
          id="sec-experience"
          title="工作与实习"
          onAdd={() => set({ ...draft, experiences: [...draft.experiences, emptyExperience()] })}
        >
          {draft.experiences.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, experiences: removeById(draft.experiences, item.id) })}>
              <div className="fields">
                <TextField label="公司或机构" value={item.organization} onChange={(organization) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { organization }) })} />
                <TextField label="职位" value={item.position} onChange={(position) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { position }) })} />
                <TextField label="地点" value={item.location} onChange={(location) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { location }) })} />
                <TextField label="公司网址" value={item.url} onChange={(url) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { url }) })} />
                <MonthField label="开始" value={item.startDate} onChange={(startDate) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { startDate }) })} />
                <MonthField label="结束" value={item.endDate} onChange={(endDate) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { endDate }) })} />
                <AreaField label="职责概述" value={item.summary} onChange={(summary) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { summary }) })} />
                <LinesField label="成果要点" value={item.highlights} onChange={(highlights) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { highlights }) })} placeholder="每行一条" />
                <TokensField label="关键词" value={item.keywords} onChange={(keywords) => set({ ...draft, experiences: updateById(draft.experiences, item.id, { keywords }) })} placeholder="用顿号分隔" />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'projects') return (
        <RepeatSection
          id="sec-projects"
          title="项目经历"
          onAdd={() => set({ ...draft, projects: [...draft.projects, emptyProject()] })}
        >
          {draft.projects.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, projects: removeById(draft.projects, item.id) })}>
              <div className="fields">
                <TextField label="项目名称" value={item.name} onChange={(name) => set({ ...draft, projects: updateById(draft.projects, item.id, { name }) })} />
                <TextField label="角色" value={item.role} onChange={(role) => set({ ...draft, projects: updateById(draft.projects, item.id, { role }) })} />
                <TextField label="所属组织" value={item.entity} onChange={(entity) => set({ ...draft, projects: updateById(draft.projects, item.id, { entity }) })} />
                <TextField label="类型" value={item.type} onChange={(type) => set({ ...draft, projects: updateById(draft.projects, item.id, { type }) })} />
                <MonthField label="开始" value={item.startDate} onChange={(startDate) => set({ ...draft, projects: updateById(draft.projects, item.id, { startDate }) })} />
                <MonthField label="结束" value={item.endDate} onChange={(endDate) => set({ ...draft, projects: updateById(draft.projects, item.id, { endDate }) })} />
                <TextField label="链接" wide value={item.url} onChange={(url) => set({ ...draft, projects: updateById(draft.projects, item.id, { url }) })} />
                <AreaField label="概述" value={item.summary} onChange={(summary) => set({ ...draft, projects: updateById(draft.projects, item.id, { summary }) })} />
                <LinesField label="要点" value={item.highlights} onChange={(highlights) => set({ ...draft, projects: updateById(draft.projects, item.id, { highlights }) })} placeholder="每行一条" />
                <TokensField label="技术或方法关键词" value={item.keywords} onChange={(keywords) => set({ ...draft, projects: updateById(draft.projects, item.id, { keywords }) })} placeholder="用顿号分隔" />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'education') return (
        <RepeatSection
          id="sec-education"
          title="教育背景"
          onAdd={() => set({ ...draft, education: [...draft.education, emptyEducation()] })}
        >
          {draft.education.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, education: removeById(draft.education, item.id) })}>
              <div className="fields">
                <TextField label="学校" value={item.school} onChange={(school) => set({ ...draft, education: updateById(draft.education, item.id, { school }) })} />
                <TextField label="学历" value={item.degree} onChange={(degree) => set({ ...draft, education: updateById(draft.education, item.id, { degree }) })} />
                <TextField label="专业" value={item.area} onChange={(area) => set({ ...draft, education: updateById(draft.education, item.id, { area }) })} />
                <TextField label="地点" value={item.location} onChange={(location) => set({ ...draft, education: updateById(draft.education, item.id, { location }) })} />
                <MonthField label="开始" value={item.startDate} onChange={(startDate) => set({ ...draft, education: updateById(draft.education, item.id, { startDate }) })} />
                <MonthField label="结束" value={item.endDate} onChange={(endDate) => set({ ...draft, education: updateById(draft.education, item.id, { endDate }) })} />
                <TextField label="学历性质" value={item.studyMode} onChange={(studyMode) => set({ ...draft, education: updateById(draft.education, item.id, { studyMode }) })} placeholder="全日制、自考、成人教育" />
                <TextField label="成绩" value={item.score} onChange={(score) => set({ ...draft, education: updateById(draft.education, item.id, { score }) })} placeholder="GPA 或排名" />
                <TokensField label="相关课程" value={item.courses} onChange={(courses) => set({ ...draft, education: updateById(draft.education, item.id, { courses }) })} placeholder="用顿号分隔" />
                <TextField label="交换或游学" wide value={item.exchange} onChange={(exchange) => set({ ...draft, education: updateById(draft.education, item.id, { exchange }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'skills') return (
        <RepeatSection
          id="sec-skills"
          title="技能"
          onAdd={() => set({ ...draft, skills: [...draft.skills, emptySkill()] })}
        >
          {draft.skills.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, skills: removeById(draft.skills, item.id) })}>
              <div className="fields">
                <TextField label="分组名称" value={item.name} onChange={(name) => set({ ...draft, skills: updateById(draft.skills, item.id, { name }) })} />
                <ChoiceField
                  label="熟练度"
                  value={item.level}
                  options={catalog.skillLevel}
                  onChange={(level) => set({ ...draft, skills: updateById(draft.skills, item.id, { level: level as SkillLevel }) })}
                />
                <TokensField label="关键词" value={item.keywords} onChange={(keywords) => set({ ...draft, skills: updateById(draft.skills, item.id, { keywords }) })} placeholder="用顿号分隔" />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'languages') return (
        <RepeatSection
          id="sec-languages"
          title="语言"
          onAdd={() => set({ ...draft, languages: [...draft.languages, emptyLanguage()] })}
        >
          {draft.languages.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, languages: removeById(draft.languages, item.id) })}>
              <div className="fields">
                <TextField label="语种" value={item.language} onChange={(language) => set({ ...draft, languages: updateById(draft.languages, item.id, { language }) })} />
                <TextField label="熟练度或成绩" value={item.fluency} onChange={(fluency) => set({ ...draft, languages: updateById(draft.languages, item.id, { fluency }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'certificates') return (
        <RepeatSection
          id="sec-certificates"
          title="证书"
          onAdd={() => set({ ...draft, certificates: [...draft.certificates, emptyCertificate()] })}
        >
          {draft.certificates.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, certificates: removeById(draft.certificates, item.id) })}>
              <div className="fields">
                <TextField label="名称" value={item.name} onChange={(name) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { name }) })} />
                <TextField label="颁发机构" value={item.issuer} onChange={(issuer) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { issuer }) })} />
                <MonthField label="获得时间" value={item.date} onChange={(date) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { date }) })} />
                <MonthField label="有效期" value={item.expiryDate} onChange={(expiryDate) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { expiryDate }) })} />
                <TextField label="证书编号" value={item.credentialId} onChange={(credentialId) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { credentialId }) })} />
                <TextField label="验证链接" value={item.url} onChange={(url) => set({ ...draft, certificates: updateById(draft.certificates, item.id, { url }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'awards') return (
        <RepeatSection
          id="sec-awards"
          title="荣誉"
          onAdd={() => set({ ...draft, awards: [...draft.awards, emptyAward()] })}
        >
          {draft.awards.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, awards: removeById(draft.awards, item.id) })}>
              <div className="fields">
                <TextField label="名称" value={item.title} onChange={(title) => set({ ...draft, awards: updateById(draft.awards, item.id, { title }) })} />
                <TextField label="颁发方" value={item.awarder} onChange={(awarder) => set({ ...draft, awards: updateById(draft.awards, item.id, { awarder }) })} />
                <MonthField label="时间" value={item.date} onChange={(date) => set({ ...draft, awards: updateById(draft.awards, item.id, { date }) })} />
                <TextField label="说明" wide value={item.summary} onChange={(summary) => set({ ...draft, awards: updateById(draft.awards, item.id, { summary }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'activities') return (
        <RepeatSection
          id="sec-activities"
          title="校园、社团与志愿"
          onAdd={() => set({ ...draft, activities: [...draft.activities, emptyActivity()] })}
        >
          {draft.activities.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, activities: removeById(draft.activities, item.id) })}>
              <div className="fields">
                <TextField label="组织" value={item.organization} onChange={(organization) => set({ ...draft, activities: updateById(draft.activities, item.id, { organization }) })} />
                <TextField label="角色" value={item.position} onChange={(position) => set({ ...draft, activities: updateById(draft.activities, item.id, { position }) })} />
                <TextField label="地点" value={item.location} onChange={(location) => set({ ...draft, activities: updateById(draft.activities, item.id, { location }) })} />
                <MonthField label="开始" value={item.startDate} onChange={(startDate) => set({ ...draft, activities: updateById(draft.activities, item.id, { startDate }) })} />
                <MonthField label="结束" value={item.endDate} onChange={(endDate) => set({ ...draft, activities: updateById(draft.activities, item.id, { endDate }) })} />
                <LinesField label="要点" value={item.highlights} onChange={(highlights) => set({ ...draft, activities: updateById(draft.activities, item.id, { highlights }) })} placeholder="每行一条" />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'interests') return (
        <section className="section-body" id="sec-interests">
          <div className="block-head">
            <Button type="link" onClick={() => set({ ...draft, interests: [...draft.interests, ''] })}>添加一条</Button>
          </div>
          {draft.interests.map((interest, index) => (
            <div className="item" key={`interest-${index}`}>
              <div className="item-head">
                <span className="item-index">第 {index + 1} 条</span>
                <Button
                  type="link"
                  danger
                  onClick={() => set({ ...draft, interests: draft.interests.filter((_, itemIndex) => itemIndex !== index) })}
                >
                  删除
                </Button>
              </div>
              <div className="fields">
                <TextField
                  label="内容"
                  wide
                  value={interest}
                  onChange={(text) => set({
                    ...draft,
                    interests: draft.interests.map((item, itemIndex) => (itemIndex === index ? text : item)),
                  })}
                />
              </div>
            </div>
          ))}
        </section>
  )
  if (id === 'publications') return (
        <RepeatSection
          id="sec-publications"
          title="发表与专利"
          onAdd={() => set({ ...draft, publications: [...draft.publications, emptyPublication()] })}
        >
          {draft.publications.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, publications: removeById(draft.publications, item.id) })}>
              <div className="fields">
                <TextField label="名称" value={item.name} onChange={(name) => set({ ...draft, publications: updateById(draft.publications, item.id, { name }) })} />
                <TextField label="类型" value={item.type} onChange={(type) => set({ ...draft, publications: updateById(draft.publications, item.id, { type }) })} placeholder="论文、会议报告、专利" />
                <TextField label="发表处或权利人" value={item.publisher} onChange={(publisher) => set({ ...draft, publications: updateById(draft.publications, item.id, { publisher }) })} />
                <MonthField label="时间" value={item.date} onChange={(date) => set({ ...draft, publications: updateById(draft.publications, item.id, { date }) })} />
                <TextField label="链接或标识" wide value={item.url} onChange={(url) => set({ ...draft, publications: updateById(draft.publications, item.id, { url }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  if (id === 'references') return (
        <RepeatSection
          id="sec-references"
          title="推荐人"
          onAdd={() => set({ ...draft, references: [...draft.references, emptyReference()] })}
        >
          <Checkbox
            className="check"
            checked={draft.referencesOnRequest}
            onChange={(event) => set({ ...draft, referencesOnRequest: event.target.checked })}
          >
            没有具体推荐人时，注明「如需要可提供」
          </Checkbox>
          {draft.references.map((item, index) => (
            <Item key={item.id} index={index} onRemove={() => set({ ...draft, references: removeById(draft.references, item.id) })}>
              <div className="fields">
                <TextField label="姓名" value={item.name} onChange={(name) => set({ ...draft, references: updateById(draft.references, item.id, { name }) })} />
                <TextField label="关系" value={item.relationship} onChange={(relationship) => set({ ...draft, references: updateById(draft.references, item.id, { relationship }) })} />
                <TextField label="单位与职位" wide value={item.organization} onChange={(organization) => set({ ...draft, references: updateById(draft.references, item.id, { organization }) })} />
                <TextField label="电话" value={item.phone} onChange={(phone) => set({ ...draft, references: updateById(draft.references, item.id, { phone }) })} />
                <TextField label="邮箱" value={item.email} onChange={(email) => set({ ...draft, references: updateById(draft.references, item.id, { email }) })} />
              </div>
            </Item>
          ))}
        </RepeatSection>
  )
  return null
}

function RepeatSection({
  id,
  onAdd,
  children,
}: {
  id: string
  title: string
  onAdd: () => void
  children: ReactNode
}): ReactNode {
  return (
    <section className="section-body" id={id}>
      <div className="block-head">
        <Button type="link" onClick={onAdd}>添加一条</Button>
      </div>
      {children}
    </section>
  )
}

function ItemList({
  title,
  onAdd,
  children,
}: {
  title: string
  onAdd: () => void
  children: ReactNode
}): ReactNode {
  return (
    <div>
      <div className="block-head" style={{ marginTop: 14 }}>
        <h2>{title}</h2>
        <Button type="link" onClick={onAdd}>添加一条</Button>
      </div>
      {children}
    </div>
  )
}

function Item({
  index,
  onRemove,
  children,
}: {
  index: number
  onRemove: () => void
  children: ReactNode
}): ReactNode {
  return (
    <article className="item">
      <div className="item-head">
        <span className="item-index">第 {index + 1} 条</span>
        <Button type="link" danger onClick={onRemove}>删除</Button>
      </div>
      {children}
    </article>
  )
}
