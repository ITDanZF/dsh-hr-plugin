import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { ResumeDraft } from '../draft.js'
import { renderTemplate } from './registry.js'

type Lane = 'single' | 'side' | 'main'
type Page = { article: HTMLElement, lanes: Record<Lane, HTMLElement>, maps: Record<Lane, Map<Element, HTMLElement>>, counts: Record<Lane, number> }

export function PagedResume({ draft, onPagesChange }: { draft: ResumeDraft, onPagesChange?: (count: number) => void }): ReactNode {
  const sourceRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const source = sourceRef.current?.firstElementChild as HTMLElement | null
    const target = pagesRef.current
    if (!source || !target) return
    const reflow = () => {
      const count = paginateSheet(source, target)
      onPagesChange?.(count)
    }
    reflow()
    const observer = new ResizeObserver(reflow)
    observer.observe(source)
    for (const image of Array.from(source.querySelectorAll('img'))) image.addEventListener('load', reflow)
    void document.fonts.ready.then(reflow)
    return () => {
      observer.disconnect()
      for (const image of Array.from(source.querySelectorAll('img'))) image.removeEventListener('load', reflow)
    }
  }, [draft])

  return <div className="paged-resume">
    <div className="pagination-source" ref={sourceRef} aria-hidden="true">{renderTemplate(draft)}</div>
    <div className="paginated-pages" ref={pagesRef} />
  </div>
}

function paginateSheet(source: HTMLElement, target: HTMLElement): number {
  target.replaceChildren()
  const sourceSide = source.querySelector(':scope > .sheet-side')
  const sourceMain = source.querySelector(':scope > .sheet-main')
  const sidebar = Boolean(sourceSide && sourceMain)
  const pages: Page[] = []
  let lastSidePage = Number.POSITIVE_INFINITY

  function pageAt(index: number): Page {
    if (pages[index]) return pages[index]!
    const article = source.cloneNode(false) as HTMLElement
    article.classList.add('paged-sheet')
    if (sidebar && index > lastSidePage) article.classList.add('side-empty')
    const lanes = { single: article, side: article, main: article }
    if (sidebar) {
      lanes.side = sourceSide!.cloneNode(false) as HTMLElement
      lanes.main = sourceMain!.cloneNode(false) as HTMLElement
      article.append(lanes.side, lanes.main)
    }
    const page: Page = {
      article,
      lanes,
      maps: { single: new Map(), side: new Map(), main: new Map() },
      counts: { single: 0, side: 0, main: 0 },
    }
    pages.push(page)
    target.append(article)
    return page
  }

  function flow(root: Element, lane: Lane): void {
    let pageIndex = 0
    const startedSections = new Set<Element>()
    const fits = (page: Page) => page.lanes[lane].scrollHeight <= page.article.clientHeight + 1
    const nextPage = () => {
      const current = pageAt(pageIndex)
      for (const [sourceNode, wrapper] of current.maps[lane]) {
        if (sourceNode.matches('section') && wrapper.children.length === 1 && wrapper.firstElementChild?.matches('h2')) {
          wrapper.remove()
        }
      }
      return pageAt(++pageIndex)
    }

    function markContent(element: Element, ancestors: Element[]): void {
      if (element.matches('section')) startedSections.add(element)
      for (const ancestor of ancestors) {
        if (ancestor.matches('section') && element !== ancestor.querySelector(':scope > h2')) startedSections.add(ancestor)
      }
    }

    function parentFor(page: Page, ancestors: Element[], child: Element): HTMLElement {
      let parent = page.lanes[lane]
      for (let index = 0; index < ancestors.length; index += 1) {
        const sourceAncestor = ancestors[index]!
        let wrapper = page.maps[lane].get(sourceAncestor)
        if (!wrapper) {
          wrapper = sourceAncestor.cloneNode(false) as HTMLElement
          parent.append(wrapper)
          page.maps[lane].set(sourceAncestor, wrapper)
          const next = ancestors[index + 1] ?? child
          const heading = sourceAncestor.matches('section') ? sourceAncestor.querySelector(':scope > h2') : null
          if (heading && next !== heading) {
            const repeated = heading.cloneNode(true) as HTMLElement
            repeated.textContent = startedSections.has(sourceAncestor) ? `${heading.textContent ?? ''}（续）` : heading.textContent
            wrapper.append(repeated)
          }
        }
        parent = wrapper
      }
      return parent
    }

    function splitText(element: Element, ancestors: Element[]): void {
      let remaining = [...(element.textContent ?? '')]
      while (remaining.length) {
        let page = pageAt(pageIndex)
        let parent = parentFor(page, ancestors, element)
        const fragment = element.cloneNode(false) as HTMLElement
        parent.append(fragment)
        let low = 1
        let high = remaining.length
        let best = 0
        while (low <= high) {
          const middle = Math.floor((low + high) / 2)
          fragment.textContent = remaining.slice(0, middle).join('')
          if (fits(page)) { best = middle; low = middle + 1 } else high = middle - 1
        }
        if (!best && page.counts[lane] > 0) {
          fragment.remove()
          nextPage()
          continue
        }
        fragment.textContent = remaining.slice(0, Math.max(best, 1)).join('')
        remaining = remaining.slice(Math.max(best, 1))
        page.counts[lane] += 1
        markContent(element, ancestors)
        if (remaining.length) nextPage()
      }
    }

    function place(element: Element, ancestors: Element[]): void {
      let page = pageAt(pageIndex)
      let parent = parentFor(page, ancestors, element)
      let clone = element.cloneNode(true) as HTMLElement
      parent.append(clone)
      if (fits(page)) { page.counts[lane] += 1; markContent(element, ancestors); return }
      clone.remove()
      const hasDirectText = Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      if (element.children.length && !hasDirectText) {
        for (const child of Array.from(element.children)) place(child, [...ancestors, element])
        return
      }
      if (!element.children.length && element.textContent?.trim()) {
        splitText(element, ancestors)
        return
      }
      if (page.counts[lane] > 0) {
        page = nextPage()
        parent = parentFor(page, ancestors, element)
        clone = element.cloneNode(true) as HTMLElement
        parent.append(clone)
        if (fits(page)) { page.counts[lane] += 1; markContent(element, ancestors); return }
        clone.remove()
      }
      if (element.textContent?.trim()) {
        splitText(element, ancestors)
      }
    }

    for (const child of Array.from(root.children)) place(child, [])
  }

  if (sidebar) {
    flow(sourceSide!, 'side')
    lastSidePage = pages.reduce((last, page, index) => page.counts.side > 0 ? index : last, -1)
    pages.forEach((page, index) => {
      if (index > lastSidePage) page.article.classList.add('side-empty')
    })
    flow(sourceMain!, 'main')
  } else flow(source, 'single')
  if (!pages.length) pageAt(0)
  return pages.length
}
