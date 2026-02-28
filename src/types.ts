export type SheetMember = {
  ID: string;
  Hoten: string;
  Gioitinh: string;
  Doithu: number;
  ID_Cha: string | null;
  ID_Me: string | null;
  ThuTuCon: number;
  NgaySinh: string;
  NgayMat: string;
  LoaiNgayMat: string;
  Tieusungan: string;
  Loaithanhvien: string;
  HocVi_ChucVu: string;
  TenThuy: string;
  NgayGio_Am: string;
  ViTriMo_QueQuan: string;
};

export type FamilyGroup = {
  spouse: SheetMember | null;
  children: TreeNode[];
};

export type TreeNode = {
  mainMember: SheetMember;
  families: FamilyGroup[];
};
