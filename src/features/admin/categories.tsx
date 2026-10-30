import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react'
import { AppShell, Button, PageIntro, Toast, Modal } from '../../components/ui'
import { initialCategories, type ReportCategory } from '../../shared/report-data'

export function AdminCategories() {
  const [categories, setCategories] = useState<ReportCategory[]>(initialCategories)
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState<ReportCategory | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', icon: '•' })
  const [deleting, setDeleting] = useState<ReportCategory | null>(null)

  const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const openCreate = () => { setForm({ name: '', slug: '', icon: '•' }); setCreating(true) }
  const openEdit = (c: ReportCategory) => { setForm({ name: c.name, slug: c.slug, icon: c.icon }); setEditing(c) }

  const saveCreate = () => {
    if (!form.name.trim()) { setToast('Nama kategori wajib diisi.'); return }
    const slug = form.slug.trim() || slugify(form.name)
    if (categories.some(c => c.slug === slug)) { setToast('Slug sudah digunakan.'); return }
    setCategories(prev => [...prev, { id: `cat-${slug}`, name: form.name.trim(), slug, icon: form.icon, active: true }])
    setCreating(false)
    setToast('Kategori ditambahkan.')
  }
  const saveEdit = () => {
    if (!editing) return
    if (!form.name.trim()) { setToast('Nama kategori wajib diisi.'); return }
    const slug = form.slug.trim() || slugify(form.name)
    if (categories.some(c => c.id !== editing.id && c.slug === slug)) { setToast('Slug sudah digunakan.'); return }
    setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, name: form.name.trim(), slug, icon: form.icon } : c))
    setEditing(null)
    setToast('Kategori diperbarui.')
  }
  const toggle = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
  const confirmDelete = () => {
    if (!deleting) return
    setCategories(prev => prev.filter(c => c.id !== deleting.id))
    setDeleting(null)
    setToast('Kategori dihapus.')
  }

  const closeForm = () => { setCreating(false); setEditing(null) }

  return (
    <AppShell mode="admin">
      <main className="page container">
        <Link to="/admin" className="back-link"><ArrowLeft size={16} /> Kembali ke dashboard</Link>
        <PageIntro eyebrow="ADMINISTRATOR PLATFORM" title="Manajemen kategori laporan" description="Kelola kategori yang tersedia untuk pelapor." action={<Button onClick={openCreate} variant="primary" icon={<Plus size={16} />}>Tambah kategori</Button>} />
        <div className="stats-grid admin-stats">
          <div className="stat-card"><span>Total kategori</span><b>{categories.length}</b></div>
          <div className="stat-card"><span>Aktif</span><b>{categories.filter(c => c.active).length}</b></div>
          <div className="stat-card"><span>Nonaktif</span><b>{categories.filter(c => !c.active).length}</b></div>
        </div>
        <section className="panel admin-table-panel">
          <div className="table-scroll">
            <table>
              <thead><tr><th>NAMA</th><th>SLUG</th><th>IKON</th><th>STATUS</th><th>AKSI</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td>{c.icon}</td>
                    <td>{c.active ? 'Aktif' : 'Nonaktif'}</td>
                    <td className="row-actions">
                      <button className="icon-button" onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={16} /></button>
                      <button className="icon-button" onClick={() => toggle(c.id)} aria-label="Toggle">{c.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                      <button className="icon-button danger" onClick={() => setDeleting(c)} aria-label="Hapus"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {(creating || editing) && (
        <Modal title={creating ? 'Tambah kategori' : 'Edit kategori'} onClose={closeForm}>
          <div className="form-field"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div className="form-field"><label>Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="form-field"><label>Ikon</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
          <div className="modal-actions">
            <Button onClick={creating ? saveCreate : saveEdit} variant="primary" icon={<CheckCircle2 size={16} />}>Simpan</Button>
            <Button onClick={closeForm} variant="outline">Batal</Button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal title="Hapus kategori" onClose={() => setDeleting(null)}>
          <p>Hapus kategori "{deleting.name}"?</p>
          <div className="modal-actions">
            <Button onClick={confirmDelete} variant="primary">Hapus</Button>
            <Button onClick={() => setDeleting(null)} variant="outline">Batal</Button>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </AppShell>
  )
}