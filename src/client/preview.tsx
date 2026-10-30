import { createRoot } from 'react-dom/client'
import { ResumePanel } from './ResumePanel.js'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<ResumePanel />)
}
