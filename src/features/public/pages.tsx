import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock3, FileCheck2, FilePlus2, Filter, ImagePlus, Info, LayoutDashboard, ListFilter, LockKeyhole, LogIn, MapPin, Menu, MessageSquareText, MoreHorizontal, Search, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react'
import { AppShell, Button, CategoryIcon, Dropdown, PageIntro, ReportCard, StatCard, StatusBadge, Timeline, TextField, Toast, Modal } from '../../components/ui'
import { countByStatus, publicReports, publicStatuses, latestNote, toCard, useReports } from '../../shared/report-store'
import { statusInfo, type Status } from '../../shared/report-data'
export function Home(){
  const reports=useReports()
  const visible=publicReports(reports)
  const counts=countByStatus(visible)
  const total=visible.length
  const resolvedPct=total?Math.round((counts.RESOLVED/total)*100):0
  return <AppShell><main>
    <section className="hero"><div className="hero-inner"><div className="hero-copy">
      
      <h1>Laporan warga,<br/>tindak lanjut yang <em>terbuka.</em></h1>
      <p>Catat kondisi jalan, lampu, sampah, atau saluran air di sekitarmu. Status dan catatan tindak lanjutnya bisa diikuti siapa saja.</p>
      <div className="hero-actions"><Button to="/daftar" icon={<ArrowRight size={17}/>}>Mulai buat laporan</Button><Button to="/laporan" variant="outline">Jelajahi laporan</Button></div>
      <div className="hero-note"><ShieldCheck size={16}/> Nama dan kontak pelapor tidak ditampilkan</div>
    </div></div></section>
    <section className="section container">
      <div className="section-head"><div><h2>Kondisi laporan<br/>hari ini.</h2></div><Link to="/statistik" className="text-link">Lihat ringkasan <ArrowRight size={16}/></Link></div>
      <div className="stats-grid">
        <StatCard label="Laporan publik" value={String(total)} detail="Sudah ditinjau admin" icon={<FileCheck2 size={19}/>}/>
        <StatCard label="Dalam tindak lanjut" value={String(counts.IN_PROGRESS)} detail="Sedang dikerjakan" icon={<SlidersHorizontal size={19}/>}/>
        <StatCard label="Selesai dicatat" value={String(counts.RESOLVED)} detail={`${resolvedPct}% dari laporan publik`} icon={<CheckCircle2 size={19}/>}/>
        <Link to="/laporan" className="stat-note"><ArrowRight size={17}/><span><b>Telusuri laporan</b><br/>Lihat semua laporan warga.</span></Link>
      </div>
    </section>
    <section className="section recent-section"><div className="container">
      <div className="section-head compact"><div><h2>Laporan terbaru</h2><p>Tiga laporan terakhir yang sudah ditinjau.</p></div><Link to="/laporan" className="text-link">Semua laporan <ArrowRight size={16}/></Link></div>
      <div className="report-grid">{visible.slice(0,3).map(r=><ReportCard key={r.code} report={toCard(r)}/>)}</div>
    </div></section>
    <section className="steps-section"><div className="container steps-inner">
      <div className="steps-title"><h2>Empat langkah,<br/>satu laporan.</h2><p>Setiap laporan punya jejak yang bisa diikuti, dari pertama dicatat sampai catatan tindak lanjut terakhir.</p><Button to="/tentang" variant="outline" icon={<ArrowRight size={16}/>}>Baca alurnya</Button></div>
      <div className="steps-list">{[['01','Bagikan temuan','Ceritakan kondisi dan lokasi yang perlu diperhatikan.'],['02','Menunggu verifikasi','Administrator platform meninjau laporan yang masuk.'],['03','Ikuti perkembangannya','Baca catatan dan status terbaru pada halaman laporan.'],['04','Lihat catatan selesai','Bukti tindak lanjut dicatat secara terbuka.']].map(([n,t,d])=><article className="step" key={n}><span className="step-number">{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight size={17}/></article>)}</div>
    </div></section>
    <section className="disclaimer container"><div className="disclaimer-icon"><Info size={20}/></div><div><b>Ruang warga berbasis komunitas.</b><p>LaporinAja adalah prototype kompetisi, bukan kanal resmi pemerintah dan tidak terhubung dengan instansi mana pun.</p></div><Link to="/tentang" aria-label="Baca tentang LaporinAja"><ArrowRight size={18}/></Link></section>
  </main></AppShell>
}

export function Reports(){const [status,setStatus]=useState('Semua status'),[category,setCategory]=useState('Semua kategori'),[q,setQ]=useState('');const all=publicReports(useReports()).map(toCard);const rows=all.filter(r=>(status==='Semua status'||statusInfo[r.status].text===status)&&(category==='Semua kategori'||r.category===category)&&`${r.title} ${r.district} ${r.village}`.toLowerCase().includes(q.toLowerCase()));return <AppShell><main className="page container"><PageIntro title="Laporan warga" description="Temukan laporan fasilitas publik dan ikuti catatan perkembangannya." action={<Button to="/daftar" icon={<FilePlus2 size={17}/>}>Buat laporan</Button>}/><section className="filter-panel" aria-label="Filter laporan"><label className="search-field"><Search size={18}/><span className="sr-only">Cari laporan</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari judul atau wilayah…"/></label><Dropdown label="Filter kategori" value={category} onChange={setCategory} icon={<ListFilter size={17}/>} options={[{value:'Semua kategori',label:'Semua kategori'},{value:'Jalan rusak',label:'Jalan rusak'},{value:'Lampu jalan',label:'Lampu jalan'},{value:'Sampah',label:'Sampah'},{value:'Saluran air',label:'Saluran air'},{value:'Fasilitas umum',label:'Fasilitas umum'}]}/><Dropdown label="Filter status" value={status} onChange={setStatus} icon={<Filter size={16}/>} options={[{value:'Semua status',label:'Semua status'},...publicStatuses.map(s=>({value:s,label:statusInfo[s].text}))]}/><span className="result-count">{rows.length} laporan</span></section><div className="report-grid listing-grid">{rows.map(r=><ReportCard key={r.code} report={r}/>)}</div>{rows.length===0&&<div className="empty-state"><Search size={25}/><h2>Belum ada laporan yang sesuai</h2><p>Coba ubah kata kunci atau atur ulang filter.</p><Button variant="outline" onClick={()=>{setQ('');setCategory('Semua kategori');setStatus('Semua status')}}>Atur ulang filter</Button></div>}<div className="pagination"><span>Menampilkan {rows.length} dari {all.length} laporan publik</span><div><button aria-label="Halaman sebelumnya" disabled><ChevronLeft size={17}/></button><button className="current-page" aria-current="page">1</button><button aria-label="Halaman 2">2</button><button aria-label="Halaman selanjutnya"><ChevronRight size={17}/></button></div></div></main></AppShell>}

export function Detail(){const {code=''}=useParams();const found=publicReports(useReports()).find(r=>r.code===code);if(!found)return <AppShell><main className="page container"><Link to="/laporan" className="back-link"><ArrowLeft size={16}/> Kembali ke daftar laporan</Link><div className="empty-state"><Search size={25}/><h2>Laporan tidak ditemukan</h2><p>Laporan ini belum dipublikasikan atau tautannya sudah berubah.</p><Button to="/laporan" variant="outline">Lihat semua laporan</Button></div></main></AppShell>;const report=toCard(found),notes=found.history,last=latestNote(found);return <AppShell><main className="page container"><Link to="/laporan" className="back-link"><ArrowLeft size={16}/> Kembali ke daftar laporan</Link><div className="detail-heading"><div><div className="eyebrow"><span/> {report.code}</div><h1>{report.title}</h1><div className="detail-meta"><span>{report.category}</span><span>·</span><MapPin size={14}/><span>{report.village}, {report.district}</span><span>·</span><span>{report.date}</span></div></div><StatusBadge status={report.status}/></div><div className="detail-layout"><div className="detail-main"><div className={`detail-art report-art ${report.tone}`}><span className="art-symbol"><CategoryIcon category={report.category} size={52}/></span><span className="art-code">Dokumentasi laporan · {report.code}</span></div><section className="detail-block"><h2>Tentang laporan</h2><p>{report.description}</p><p className="privacy-hint"><LockKeyhole size={15}/> Identitas pelapor tidak ditampilkan.</p></section><section className="detail-block"><h2>Catatan tindak lanjut</h2><div className="follow-card"><span className="follow-icon"><MessageSquareText size={17}/></span><div><b>{last.title}</b><p>{last.note}</p><small>Administrator platform · {last.at}</small></div></div></section></div><aside className="detail-aside"><section className="aside-card"><div className="aside-card-head"><h2>Jejak laporan</h2><span>{notes.length} LANGKAH</span></div><Timeline report={report} history={notes}/></section><section className="aside-card location-card"><h2>Wilayah</h2><p><MapPin size={16}/>{report.village}, {report.district}</p><small>Patokan lokasi terperinci tidak ditampilkan di halaman publik.</small></section><button className="share-button" onClick={()=>navigator.clipboard?.writeText(window.location.href)}>Salin tautan laporan <ArrowUpRight size={16}/></button></aside></div></main></AppShell>}

export function Statistics({admin=false}:{admin?:boolean}){
  const reports=useReports()
  const visible=publicReports(reports)
  const counts=countByStatus(visible)
  const total=visible.length
  const pct=(n:number)=>total?Math.round((n/total)*100):0
  const byCategory=Object.entries(visible.reduce<Record<string,number>>((acc,row)=>{acc[row.category]=(acc[row.category]??0)+1;return acc},{})).sort((a,b)=>b[1]-a[1])
  const bars:[string,number,string][]=[['Terverifikasi',counts.VERIFIED,'verified'],['Dalam tindak lanjut',counts.IN_PROGRESS,'progress'],['Selesai dicatat',counts.RESOLVED,'resolved'],['Laporan serupa',counts.DUPLICATE,'duplicate']]
  return <AppShell mode={admin?'admin':'public'}><main className="page container">
    <PageIntro title="Statistik laporan" description="Angka di halaman ini dihitung dari data demo yang sama dengan ruang admin."/>
    <div className="stats-grid stats-page-grid">
      <StatCard label="Laporan publik" value={String(total)} detail="Sudah ditinjau admin" icon={<FileCheck2 size={19}/>}/>
      <StatCard label="Dalam tindak lanjut" value={String(counts.IN_PROGRESS)} detail={`${pct(counts.IN_PROGRESS)}% dari laporan publik`} icon={<SlidersHorizontal size={19}/>}/>
      <StatCard label="Selesai dicatat" value={String(counts.RESOLVED)} detail={`${pct(counts.RESOLVED)}% dari laporan publik`} icon={<CheckCircle2 size={19}/>}/>
      <StatCard label="Kategori terpakai" value={String(byCategory.length)} detail="Jenis fasilitas publik" icon={<ListFilter size={19}/>}/>
    </div>
    <div className="stats-columns">
      <section className="panel"><div className="panel-head"><div><h2>Status laporan</h2><p>Proporsi dari laporan publik</p></div></div>
        {bars.map(([name,value,tone])=><div className="bar-row" key={name}><div><span>{name}</span><b>{pct(value)}%</b></div><div className="bar-track"><i className={tone} style={{width:`${pct(value)}%`}}/></div></div>)}
        <small className="chart-note">Persentase dihitung dari laporan yang tampil di halaman publik.</small>
      </section>
      <section className="panel"><div className="panel-head"><div><h2>Menurut kategori</h2><p>Kategori pada laporan publik</p></div></div>
        {byCategory.slice(0,5).map(([name,value])=><div className="category-row" key={name}><span className="category-dot"/><span>{name}</span><b>{pct(value)}%</b></div>)}
      </section>
    </div>
  </main></AppShell>
}

export function About(){return <AppShell><main className="page container narrow-page"><PageIntro title="Ruang untuk peduli, bersama." description="LaporinAja membantu warga mencatat temuan fasilitas publik dan mengikuti jejak tindak lanjutnya."/><div className="demo-banner"><Info size={18}/><span>LaporinAja adalah <b>prototype kompetisi</b>, bukan kanal resmi pemerintah dan tidak terhubung dengan instansi mana pun.</span></div><section className="content-panel"><h2>Bagaimana alurnya?</h2><div className="about-steps">{[['01','Bagikan temuan','Lengkapi informasi dan wilayah laporan.'],['02','Ditinjau','Administrator platform meninjau laporan masuk.'],['03','Dipantau','Riwayat perubahan status tercatat.'],['04','Catatan tindak lanjut','Bukti dan catatan ditampilkan saat tersedia.']].map(([n,t,d])=><div key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section><section className="content-panel"><h2>Arti status laporan</h2><div className="status-list">{(Object.keys(statusInfo) as Status[]).map(s=><div key={s}><StatusBadge status={s}/><span>{s==='RESOLVED'?'Administrator platform mencatat tindak lanjut selesai beserta catatan atau bukti.':'Status menunjukkan tahap pencatatan laporan di platform.'}</span></div>)}</div><p className="privacy-hint"><Info size={15}/> “Selesai dicatat” menjelaskan catatan pada platform, bukan jaminan bahwa kondisi di lapangan telah teratasi.</p></section></main></AppShell>}

export function Privacy(){return <AppShell><main className="page container narrow-page"><PageIntro title="Informasi yang seperlunya." description="Kami merancang pengalaman ini agar laporan tetap berguna tanpa membuka identitas pelapor."/><section className="content-panel prose"><h2>Data pelapor</h2><p>Halaman publik tidak menampilkan nama, email, atau identitas akun pelapor. Informasi akun hanya digunakan untuk mengelola sesi dan laporan milik Anda.</p><h2>Lokasi dan foto</h2><p>Gunakan patokan umum, bukan alamat rumah. Hindari mengunggah wajah, plat nomor, atau informasi pribadi lain. Foto laporan hanya tampil setelah laporan dipublikasikan.</p><h2>Status dan tindak lanjut</h2><p>Riwayat perubahan dan catatan tindak lanjut membantu menjelaskan apa yang dicatat di platform. Status selesai bukan jaminan penyelesaian kondisi lapangan.</p><h2>Tentang prototype</h2><p>LaporinAja merupakan prototype kompetisi, bukan kanal pengaduan pemerintah.</p></section></main></AppShell>}
