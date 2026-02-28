import { useState, useEffect, useMemo } from 'react';
import { SheetMember, TreeNode, FamilyGroup } from '../types';

const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxiGs088QCJXUeuqZIvmGosomBfFWgh6ZwlL2ivy2O4SnOBfxOkSjxcSl-d7RSRdfA/exec';

const MOCK_DATA: SheetMember[] = [
  { ID: '1', Hoten: 'Phạm Văn Cội', Gioitinh: 'Nam', Doithu: 1, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1890', NgayMat: '15/08/1960', LoaiNgayMat: 'Âm', Tieusungan: 'Thủy tổ dòng họ Phạm. Người có công khai hoang lập ấp.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Quan Tri Huyện', TenThuy: 'Phúc Đức', NgayGio_Am: '15/08', ViTriMo_QueQuan: 'Nghĩa trang dòng họ' },
  { ID: '2', Hoten: 'Nguyễn Thị Nụ', Gioitinh: 'Nữ', Doithu: 1, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1895', NgayMat: '1970', LoaiNgayMat: 'Dương', Tieusungan: 'Chính thất.', Loaithanhvien: 'Phụ', HocVi_ChucVu: '', TenThuy: 'Từ Mẫn', NgayGio_Am: '10/03', ViTriMo_QueQuan: 'Nghĩa trang dòng họ' },
  { ID: '3', Hoten: 'Phạm Văn Nhất', Gioitinh: 'Nam', Doithu: 2, ID_Cha: '1', ID_Me: '2', ThuTuCon: 1, NgaySinh: '10/05/1920', NgayMat: '20/11/1990', LoaiNgayMat: 'Âm', Tieusungan: 'Trưởng nam. Kế thừa và phát triển cơ nghiệp của cha.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Trưởng Tộc', TenThuy: 'Trung Trực', NgayGio_Am: '20/11', ViTriMo_QueQuan: 'Khu A' },
  { ID: '4', Hoten: 'Trần Thị Mai', Gioitinh: 'Nữ', Doithu: 2, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1925', NgayMat: '2005', LoaiNgayMat: 'Dương', Tieusungan: 'Vợ ông Nhất.', Loaithanhvien: 'Phụ', HocVi_ChucVu: '', TenThuy: 'Đoan Trang', NgayGio_Am: '05/01', ViTriMo_QueQuan: 'Khu A' },
  { ID: '5', Hoten: 'Phạm Thị Ba', Gioitinh: 'Nữ', Doithu: 2, ID_Cha: '1', ID_Me: '2', ThuTuCon: 2, NgaySinh: '1922', NgayMat: '1995', LoaiNgayMat: 'Dương', Tieusungan: 'Trưởng nữ. Đảm đang, tháo vát.', Loaithanhvien: 'Chính', HocVi_ChucVu: '', TenThuy: 'Hiền Thục', NgayGio_Am: '12/04', ViTriMo_QueQuan: 'Làng bên' },
  { ID: '6', Hoten: 'Phạm Văn Trưởng', Gioitinh: 'Nam', Doithu: 3, ID_Cha: '3', ID_Me: '4', ThuTuCon: 1, NgaySinh: '1950', NgayMat: '', LoaiNgayMat: '', Tieusungan: 'Trưởng tôn. Hiện là trưởng tộc, coi sóc nhà thờ họ.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Tiến Sĩ', TenThuy: '', NgayGio_Am: '', ViTriMo_QueQuan: 'Hà Nội' },
  { ID: '7', Hoten: 'Phạm Văn Thứ', Gioitinh: 'Nam', Doithu: 3, ID_Cha: '3', ID_Me: '4', ThuTuCon: 2, NgaySinh: '1955', NgayMat: '', LoaiNgayMat: '', Tieusungan: 'Con trai thứ. Giáo viên về hưu.', Loaithanhvien: 'Chính', HocVi_ChucVu: '', TenThuy: '', NgayGio_Am: '', ViTriMo_QueQuan: 'Hà Nội' },
  { ID: '8', Hoten: 'Phạm Văn Chắt', Gioitinh: 'Nam', Doithu: 4, ID_Cha: '6', ID_Me: null, ThuTuCon: 1, NgaySinh: '1980', NgayMat: '', LoaiNgayMat: '', Tieusungan: 'Đích tôn đời thứ 4. Kỹ sư phần mềm.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Giám Đốc', TenThuy: '', NgayGio_Am: '', ViTriMo_QueQuan: 'TP.HCM' },
];

export function useFamilyData() {
  const [data, setData] = useState<SheetMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchUrl = `${GOOGLE_SHEET_API_URL}?t=${new Date().getTime()}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Không thể tải dữ liệu từ Google Sheet');
        const result = await response.json();
        
        const rawData = result.data || result;
        if (Array.isArray(rawData) && rawData.length > 0) {
          setData(rawData);
        } else {
          throw new Error('Định dạng dữ liệu không hợp lệ');
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Đang hiển thị dữ liệu mẫu.");
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const treeData = useMemo(() => {
    const getChildren = (parentId: string) => {
      return data.filter(m => m.ID_Cha === parentId || m.ID_Me === parentId)
                 .sort((a, b) => (a.ThuTuCon || 0) - (b.ThuTuCon || 0));
    };

    const buildNode = (member: SheetMember): TreeNode => {
      const children = getChildren(member.ID);
      const familiesMap = new Map<string, SheetMember[]>();
      const noSpouseChildren: SheetMember[] = [];

      children.forEach(c => {
        const spouseId = c.ID_Cha === member.ID ? c.ID_Me : c.ID_Cha;
        if (spouseId) {
          if (!familiesMap.has(spouseId)) familiesMap.set(spouseId, []);
          familiesMap.get(spouseId)!.push(c);
        } else {
          noSpouseChildren.push(c);
        }
      });

      const families: FamilyGroup[] = [];
      familiesMap.forEach((kids, spouseId) => {
        const spouse = data.find(m => m.ID === spouseId) || null;
        families.push({
          spouse,
          children: kids.map(k => buildNode(k))
        });
      });

      if (noSpouseChildren.length > 0) {
        families.push({
          spouse: null,
          children: noSpouseChildren.map(k => buildNode(k))
        });
      }

      return {
        mainMember: member,
        families
      };
    };

    let roots = data.filter(m => m.Doithu === 1 && (!m.Loaithanhvien || !m.Loaithanhvien.toLowerCase().includes('phụ')));
    if (roots.length === 0) {
      roots = data.filter(m => m.Doithu === 1);
      if (roots.length === 0 && data.length > 0) roots = [data[0]];
    }

    return roots.map(r => buildNode(r));
  }, [data]);

  const generations = useMemo(() => {
    const gens = new Set(data.map(m => m.Doithu).filter(d => d != null));
    return Array.from(gens).sort((a, b) => a - b);
  }, [data]);

  // Tìm tên cha mẹ dựa trên ID
  const getParents = (member: SheetMember) => {
    const father = data.find(m => m.ID === member.ID_Cha);
    const mother = data.find(m => m.ID === member.ID_Me);
    return {
      fatherName: father?.Hoten || '...',
      motherName: mother?.Hoten || '...'
    };
  };

  // Tìm bạn đời dựa trên logic con chung hoặc loại thành viên
  const getSpouse = (member: SheetMember) => {
    // Cách 1: Tìm qua con chung
    const children = data.filter(m => m.ID_Cha === member.ID || m.ID_Me === member.ID);
    for (const child of children) {
      const spouseId = child.ID_Cha === member.ID ? child.ID_Me : child.ID_Cha;
      if (spouseId) {
        const spouse = data.find(m => m.ID === spouseId);
        if (spouse) return spouse.Hoten;
      }
    }
    
    // Nếu không có con chung, tìm dựa trên logic thành viên phụ kết nối với thành viên chính
    // (Trong dữ liệu mẫu, thành viên phụ thường không có ID_Cha/ID_Me, nhưng có thể có Tieusungan ghi "Vợ ông X" - tuy nhiên khó parse)
    // Hoặc nếu là thành viên phụ, tìm người chính có cùng con.
    return 'Chưa cập nhật';
  };

  return { data, treeData, generations, loading, error, getParents, getSpouse };
}
