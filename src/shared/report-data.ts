import { Check, CheckCircle2, CircleAlert, Clock3, FileCheck2, SlidersHorizontal } from 'lucide-react'
export type Status = 'SUBMITTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'DUPLICATE'
export type Report = { code: string; title: string; category: string; district: string; village: string; status: Status; date: string; description: string; icon: string; tone: string }
export const initialReports: Report[] = [
  { code:'LPR-2026-000128', title:'Lampu jalan tidak menyala di sekitar taman', category:'Lampu jalan', district:'Coblong', village:'Dago', status:'IN_PROGRESS', date:'Hari ini, 09.42', description:'Lampu jalan di sisi taman sudah beberapa malam tidak menyala. Area menjadi cukup gelap saat malam hari.', icon:'☼', tone:'amber' },
  { code:'LPR-2026-000127', title:'Jalan berlubang dekat persimpangan', category:'Jalan rusak', district:'Sukajadi', village:'Pasteur', status:'VERIFIED', date:'Kemarin, 16.18', description:'Ada lubang cukup besar di sisi jalan dekat persimpangan. Pengendara perlu berhati-hati.', icon:'⌁', tone:'blue' },
  { code:'LPR-2026-000126', title:'Sampah menumpuk di tepi saluran', category:'Sampah', district:'Lengkong', village:'Burangrang', status:'RESOLVED', date:'25 Okt 2026', description:'Sampah menumpuk di tepi saluran dan menghambat aliran air.', icon:'♧', tone:'green' },
  { code:'LPR-2026-000125', title:'Saluran air tersumbat setelah hujan', category:'Saluran air', district:'Cicendo', village:'Arjuna', status:'SUBMITTED', date:'24 Okt 2026', description:'Aliran air tersumbat daun dan sampah setelah hujan deras.', icon:'≈', tone:'teal' },
  { code:'LPR-2026-000124', title:'Bangku taman perlu diperbaiki', category:'Fasilitas umum', district:'Bandung Wetan', village:'Citarum', status:'DUPLICATE', date:'23 Okt 2026', description:'Salah satu bangku taman terlihat rusak. Ada laporan serupa yang telah dicatat.', icon:'⌂', tone:'purple' },
  { code:'LPR-2026-000123', title:'Lampu penerangan gang padam', category:'Lampu jalan', district:'Cibeunying Kaler', village:'Cigadung', status:'REJECTED', date:'22 Okt 2026', description:'Informasi lokasi belum cukup untuk meninjau laporan ini.', icon:'☼', tone:'red' },
]

export const statusInfo: Record<Status, { text: string; icon: typeof Clock3; cls: string }> = {
  SUBMITTED:{ text:'Menunggu verifikasi', icon:Clock3, cls:'submitted' }, VERIFIED:{ text:'Terverifikasi', icon:CheckCircle2, cls:'verified' }, IN_PROGRESS:{ text:'Dalam tindak lanjut', icon:SlidersHorizontal, cls:'progress' }, RESOLVED:{ text:'Selesai dicatat', icon:Check, cls:'resolved' }, REJECTED:{ text:'Ditolak', icon:CircleAlert, cls:'rejected' }, DUPLICATE:{ text:'Laporan serupa', icon:FileCheck2, cls:'duplicate' },
}

export type ReportCategory = { id: string; name: string; slug: string; icon: string; active: boolean }

export const initialCategories: ReportCategory[] = [
  { id:'cat-jalan-rusak', name:'Jalan rusak', slug:'jalan-rusak', icon:'⌁', active:true },
  { id:'cat-lampu-jalan', name:'Lampu jalan', slug:'lampu-jalan', icon:'☼', active:true },
  { id:'cat-sampah', name:'Sampah', slug:'sampah', icon:'♧', active:true },
  { id:'cat-saluran-air', name:'Saluran air', slug:'saluran-air', icon:'≈', active:true },
  { id:'cat-fasilitas-umum', name:'Fasilitas umum', slug:'fasilitas-umum', icon:'⌂', active:true },
  { id:'cat-lainnya', name:'Lainnya', slug:'lainnya', icon:'•', active:true },
]

export const categoryNames = initialCategories.map(c => c.name)
