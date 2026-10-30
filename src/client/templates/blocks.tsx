import type { ReactNode } from 'react'
import {
  filled,
  period,
  showDate,
  visibleLines,
  visibleTokens,
  type ActivityItem,
  type AwardItem,
  type CertificateItem,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type PublicationItem,
  type DatePlace,
  type KeywordStyle,
  type ReferenceItem,
  type ResumeDraft,
} from '../draft.js'

export type BlockId =
  | 'intention'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certificates'
  | 'awards'
  | 'activities'
  | 'interests'
  | 'publications'
  | 'references'

export function ResumeHeader({ draft, showPhoto }: { draft: ResumeDraft, showPhoto?: boolean }): ReactNode {
  const { basics } = draft
  const contact = [basics.phone, basics.email, basics.location].filter((item) => item.trim())
  const links = basics.links.filter((link) => filled(link.network, link.username, link.url))
  return (
    <header>
      {showPhoto && basics.photo ? <img className="sheet-photo" src={basics.photo} alt="" /> : null}
      <h1>{basics.name.trim() || '未命名'}</h1>
      {basics.headline.trim() ? <p className="headline">{basics.headline}</p> : null}
      {contact.length > 0 ? <p className="contact">{contact.join(' · ')}</p> : null}
      {links.length > 0 ? (
        <p className="contact">
          {links.map((link, index) => (
            <span key={link.id}>
              {index > 0 ? ' · ' : ''}
              {link.url.trim()
                ? <a href={link.url}>{link.network.trim() || link.url}</a>
                : link.network || link.username}
            </span>
          ))}
        </p>
      ) : null}
    </header>
  )
}

export function DraftBlocks({ draft, order }: { draft: ResumeDraft, order: BlockId[] }): ReactNode {
  return order.map((id) => <DraftBlock key={id} id={id} draft={draft} />)
}

function DraftBlock({ id, draft }: { id: BlockId, draft: ResumeDraft }): ReactNode {
  const { datePlace, keywordStyle } = draft.appearance
  switch (id) {
    case 'intention': return <IntentionBlock draft={draft} />
    case 'summary': return draft.summary.trim() ? <Section title="职业摘要"><p>{draft.summary}</p></Section> : null
    case 'experience': return <ExperienceBlock items={draft.experiences} datePlace={datePlace} keywordStyle={keywordStyle} />
    case 'projects': return <ProjectBlock items={draft.projects} datePlace={datePlace} keywordStyle={keywordStyle} />
    case 'education': return <EducationBlock items={draft.education} datePlace={datePlace} />
    case 'skills': return <SkillBlock draft={draft} />
    case 'languages': return <LanguageBlock draft={draft} />
    case 'certificates': return <CertificateBlock items={draft.certificates} datePlace={datePlace} />
    case 'awards': return <AwardBlock items={draft.awards} datePlace={datePlace} />
    case 'activities': return <ActivityBlock items={draft.activities} datePlace={datePlace} />
    case 'interests': return <InterestBlock draft={draft} />
    case 'publications': return <PublicationBlock items={draft.publications} datePlace={datePlace} />
    case 'references': return <ReferenceBlock draft={draft} />
    default: return null
  }
}

function Section({ title, children }: { title: string, children: ReactNode }): ReactNode {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function IntentionBlock({ draft }: { draft: ResumeDraft }): ReactNode {
  const parts = [draft.intention.role, draft.intention.industry, draft.intention.cities, draft.intention.workType]
    .map((item) => item.trim())
    .filter(Boolean)
  if (parts.length === 0) return null
  return <p className="intention-line">求职意向：{parts.join(' · ')}</p>
}

function ExperienceBlock({ items, datePlace, keywordStyle }: { items: ExperienceItem[], datePlace: DatePlace, keywordStyle: KeywordStyle }): ReactNode {
  const visible = items.filter((item) => filled(
    item.organization, item.position, item.location, item.startDate, item.endDate, item.summary, item.url,
    ...item.highlights, ...item.keywords,
  ))
  if (visible.length === 0) return null
  return (
    <Section title="工作与实习经历">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle
            title={[item.position, item.organization].filter((part) => part.trim()).join(' · ') || '未命名经历'}
            date={period(item.startDate, item.endDate)}
            datePlace={datePlace}
          />
          <Meta parts={[item.location, item.summary]} />
          {item.url.trim() ? <a href={item.url}>{item.url}</a> : null}
          <BulletList lines={item.highlights} />
          <KeywordLine tokens={item.keywords} keywordStyle={keywordStyle} />
        </article>
      ))}
    </Section>
  )
}

function ProjectBlock({ items, datePlace, keywordStyle }: { items: ProjectItem[], datePlace: DatePlace, keywordStyle: KeywordStyle }): ReactNode {
  const visible = items.filter((item) => filled(
    item.name, item.role, item.entity, item.type, item.startDate, item.endDate, item.summary, item.url,
    ...item.highlights, ...item.keywords,
  ))
  if (visible.length === 0) return null
  return (
    <Section title="项目经历">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle title={item.name.trim() || '未命名项目'} date={period(item.startDate, item.endDate)} datePlace={datePlace} />
          <Meta parts={[item.role, item.entity, item.type]} />
          {item.summary.trim() ? <p>{item.summary}</p> : null}
          {item.url.trim() ? <a href={item.url}>{item.url}</a> : null}
          <BulletList lines={item.highlights} />
          <KeywordLine tokens={item.keywords} keywordStyle={keywordStyle} />
        </article>
      ))}
    </Section>
  )
}

function EducationBlock({ items, datePlace }: { items: EducationItem[], datePlace: DatePlace }): ReactNode {
  const visible = items.filter((item) => filled(
    item.school, item.degree, item.area, item.startDate, item.endDate, item.location, item.studyMode,
    item.score, item.exchange, ...item.courses,
  ))
  if (visible.length === 0) return null
  return (
    <Section title="教育背景">
      {visible.map((item) => {
        const courses = visibleTokens(item.courses)
        return (
          <article className="entry" key={item.id}>
            <EntryTitle
              title={[item.school, item.degree, item.area].filter((part) => part.trim()).join(' · ') || '未命名教育'}
              date={period(item.startDate, item.endDate)}
              datePlace={datePlace}
            />
            <Meta parts={[item.location, item.studyMode, item.score]} />
            {courses.length > 0 ? <p>相关课程：{courses.join('、')}</p> : null}
            {item.exchange.trim() ? <p>交换或游学：{item.exchange}</p> : null}
          </article>
        )
      })}
    </Section>
  )
}

function SkillBlock({ draft }: { draft: ResumeDraft }): ReactNode {
  const groups = draft.skills.filter((group) => filled(group.name, group.level, ...group.keywords))
  if (groups.length === 0) return null
  return (
    <Section title="技能">
      {groups.map((group) => {
        const keywords = visibleTokens(group.keywords)
        const label = [group.name, group.level].filter((part) => part.trim()).join(' · ')
        return (
          <p className="entry" key={group.id}>
            {label ? <strong>{label}</strong> : null}{keywords.length > 0 ? `：${keywords.join('、')}` : null}
          </p>
        )
      })}
    </Section>
  )
}

function LanguageBlock({ draft }: { draft: ResumeDraft }): ReactNode {
  const items = draft.languages.filter((item) => filled(item.language, item.fluency))
  if (items.length === 0) return null
  return (
    <Section title="语言">
      {items.map((item) => (
        <p className="entry" key={item.id}>{[item.language, item.fluency].filter((part) => part.trim()).join(' · ')}</p>
      ))}
    </Section>
  )
}

function CertificateBlock({ items, datePlace }: { items: CertificateItem[], datePlace: DatePlace }): ReactNode {
  const visible = items.filter((item) => filled(item.name, item.issuer, item.date, item.expiryDate, item.credentialId, item.url))
  if (visible.length === 0) return null
  return (
    <Section title="证书">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle title={item.name.trim() || '未命名证书'} date={showDate(item.date)} datePlace={datePlace} />
          <Meta parts={[item.issuer, item.expiryDate ? `有效期至 ${showDate(item.expiryDate)}` : '', item.credentialId]} />
          {item.url.trim() ? <a href={item.url}>{item.url}</a> : null}
        </article>
      ))}
    </Section>
  )
}

function AwardBlock({ items, datePlace }: { items: AwardItem[], datePlace: DatePlace }): ReactNode {
  const visible = items.filter((item) => filled(item.title, item.awarder, item.date, item.summary))
  if (visible.length === 0) return null
  return (
    <Section title="荣誉">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle title={item.title.trim() || '未命名荣誉'} date={showDate(item.date)} datePlace={datePlace} />
          <Meta parts={[item.awarder, item.summary]} />
        </article>
      ))}
    </Section>
  )
}

function ActivityBlock({ items, datePlace }: { items: ActivityItem[], datePlace: DatePlace }): ReactNode {
  const visible = items.filter((item) => filled(
    item.organization, item.position, item.location, item.startDate, item.endDate, ...item.highlights,
  ))
  if (visible.length === 0) return null
  return (
    <Section title="校园、社团与志愿">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle
            title={[item.position, item.organization].filter((part) => part.trim()).join(' · ') || '未命名经历'}
            date={period(item.startDate, item.endDate)}
            datePlace={datePlace}
          />
          <Meta parts={[item.location]} />
          <BulletList lines={item.highlights} />
        </article>
      ))}
    </Section>
  )
}

function InterestBlock({ draft }: { draft: ResumeDraft }): ReactNode {
  const items = draft.interests.map((item) => item.trim()).filter(Boolean)
  if (items.length === 0) return null
  return <Section title="兴趣"><p>{items.join('；')}</p></Section>
}

function PublicationBlock({ items, datePlace }: { items: PublicationItem[], datePlace: DatePlace }): ReactNode {
  const visible = items.filter((item) => filled(item.name, item.type, item.publisher, item.date, item.url))
  if (visible.length === 0) return null
  return (
    <Section title="发表与专利">
      {visible.map((item) => (
        <article className="entry" key={item.id}>
          <EntryTitle title={item.name.trim() || '未命名'} date={showDate(item.date)} datePlace={datePlace} />
          <Meta parts={[item.type, item.publisher]} />
          {item.url.trim() ? <a href={item.url}>{item.url}</a> : null}
        </article>
      ))}
    </Section>
  )
}

function ReferenceBlock({ draft }: { draft: ResumeDraft }): ReactNode {
  const people = draft.references.filter((item) => referenceVisible(item))
  if (people.length === 0 && !draft.referencesOnRequest) return null
  return (
    <Section title="推荐人">
      {people.length === 0 ? <p>如需要可提供</p> : people.map((item) => (
        <article className="entry" key={item.id}>
          <h3>{item.name.trim() || '未命名'}</h3>
          <Meta parts={[item.relationship, item.organization, item.phone, item.email]} />
        </article>
      ))}
    </Section>
  )
}

function referenceVisible(item: ReferenceItem): boolean {
  return filled(item.name, item.relationship, item.organization, item.phone, item.email)
}

function Meta({ parts }: { parts: string[] }): ReactNode {
  const text = parts.map((part) => part.trim()).filter(Boolean)
  if (text.length === 0) return null
  return <p className="meta">{text.join(' · ')}</p>
}

function BulletList({ lines }: { lines: string[] }): ReactNode {
  const visible = visibleLines(lines)
  if (visible.length === 0) return null
  return (
    <ul>
      {visible.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}
    </ul>
  )
}

function EntryTitle({ title, date, datePlace }: { title: string, date: string, datePlace: DatePlace }): ReactNode {
  return (
    <div className={datePlace === 'below' ? 'entry-head is-below' : 'entry-head'}>
      <h3>{title}</h3>
      {date.trim() ? <span className="dates">{date}</span> : null}
    </div>
  )
}

function KeywordLine({ tokens, keywordStyle }: { tokens: string[], keywordStyle: KeywordStyle }): ReactNode {
  const visible = visibleTokens(tokens)
  if (visible.length === 0) return null
  if (keywordStyle === 'text') return <p className="meta">{visible.join('、')}</p>
  return (
    <p className="sheet-tags">
      {visible.map((token) => <span key={token}>{token}</span>)}
    </p>
  )
}
