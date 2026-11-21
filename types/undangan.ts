export type Rekening = {
  id?: string;
  type: "bank" | "wallet";
  label: string;
  no: string;
  name: string;
};

export type Orang = {
  nama: string;
  keterangan: string;
};

export type UndanganDataJson = {
  judul_sampul?: string;
  tanggal_sampul?: string;
  label_acara?: string;
  tempat_singkat?: string;
  hari_acara?: string;
  tanggal_acara?: string;
  jam_acara?: string;
  jenis_acara?: string;
  agama?: string;
  nama_acara?: string;
  sekeluarga?: string;
  alamat_keluarga?: string;
  footer_text?: string;
  musik_url?: string;
  musik_judul?: string;
  musik_start?: string;
  musik_end?: string;
  musik_disabled?: boolean;
  no_wa_penerima?: string[];
};

export type Undangan = {
  id: number;
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  foto_cover: string;
  foto_acara: string;
  maps_url: string;
  hiburan: string;
  turut_mengundang: string[];
  orang_berbahagia: Orang[];
  rekening: Rekening[];
  ayat: string;
  akses_token?: string;
  token_version?: number;
  user_id?: number | null;
  tenant_name?: string | null;
  tenant_email?: string | null;
  data_json?: UndanganDataJson;
  created_at?: string | Date;
  // Dynamic fields
  judul_sampul?: string;
  tanggal_sampul?: string;
  label_acara?: string;
  tempat_singkat?: string;
  hari_acara?: string;
  tanggal_acara?: string;
  jam_acara?: string;
  sekeluarga?: string;
  alamat_keluarga?: string;
  footer_text?: string;
  musik_url?: string;
  musik_judul?: string;
  musik_start?: string;
  musik_end?: string;
  musik_disabled?: boolean;
};

export type UndanganKelola = {
  id: number;
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  akses_token?: string;
  user_id?: number | null;
  orang_berbahagia?: Array<{ nama: string; keterangan?: string }> | string;
  data_json?: {
    label_acara?: string;
    tanggal_acara?: string;
    jam_acara?: string;
    sekeluarga?: string;
    alamat_keluarga?: string;
  };
};

export type UndanganData = {
  slug?: string;
  nama_anak?: string;
  nama_orang_tua?: string;
  tanggal?: string | Date;
  jam?: string;
  lokasi?: string;
  foto_cover?: string;
  foto_acara?: string;
  maps_url?: string;
  hiburan?: string;
  turut_mengundang?: string[];
  orang_berbahagia?: Array<{ nama: string; keterangan: string }>;
  rekening?: Array<{ type: "bank" | "wallet"; label: string; no: string; name: string }>;
  ayat?: string;
  data_json?: {
    judul_sampul?: string;
    tanggal_sampul?: string;
    label_acara?: string;
    tempat_singkat?: string;
    hari_acara?: string;
    tanggal_acara?: string;
    jam_acara?: string;
    jenis_acara?: string;
    agama?: string;
    nama_acara?: string;
    no_wa_penerima?: string[];
    sekeluarga?: string;
    alamat_keluarga?: string;
    footer_text?: string;
    musik_url?: string;
    musik_judul?: string;
    musik_start?: string;
    musik_end?: string;
  };
};

export type Tamu = {
  id: number;
  undangan_id?: number;
  nama: string;
  hadir?: boolean | null;
  jumlah_orang?: number;
  ucapan?: string | null;
  rsvp_at?: string | null;
  created_at?: string;
};

export type Rsvp = {
  id: number;
  undangan_id?: number;
  nama: string;
  hadir: boolean;
  ucapan: string;
  created_at: string;
};

export type FloraVariant = "tl" | "tr" | "bl" | "br";
