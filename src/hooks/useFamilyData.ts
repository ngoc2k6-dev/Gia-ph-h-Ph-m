import { useState, useEffect, useMemo } from 'react';
import { SheetMember, TreeNode, FamilyGroup, ClanEvent } from '../types';

const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxiGs088QCJXUeuqZIvmGosomBfFWgh6ZwlL2ivy2O4SnOBfxOkSjxcSl-d7RSRdfA/exec';

const MOCK_DATA: SheetMember[] = [
  { ID: '1', Hoten: 'Phạm Văn Cội', Gioitinh: 'Nam', Doithu: 1, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1890', NgayMat: '15/08/1960', Tieusungan: 'Thủy tổ dòng họ Phạm. Người có công khai hoang lập ấp.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Quan Tri Huyện', TenThuy: 'Phúc Đức', ViTriMo_QueQuan: 'Nghĩa trang dòng họ' },
  { ID: '2', Hoten: 'Nguyễn Thị Nụ', Gioitinh: 'Nữ', Doithu: 1, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1895', NgayMat: '10/03/1970', Tieusungan: 'Chính thất.', Loaithanhvien: 'Phụ', HocVi_ChucVu: '', TenThuy: 'Từ Mẫn', ViTriMo_QueQuan: 'Nghĩa trang dòng họ' },
  { ID: '3', Hoten: 'Phạm Văn Nhất', Gioitinh: 'Nam', Doithu: 2, ID_Cha: '1', ID_Me: '2', ThuTuCon: 1, NgaySinh: '10/05/1920', NgayMat: '20/11/1990', Tieusungan: 'Trưởng nam. Kế thừa và phát triển cơ nghiệp của cha.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Trưởng Tộc', TenThuy: 'Trung Trực', ViTriMo_QueQuan: 'Khu A' },
  { ID: '4', Hoten: 'Trần Thị Mai', Gioitinh: 'Nữ', Doithu: 2, ID_Cha: null, ID_Me: null, ThuTuCon: 1, NgaySinh: '1925', NgayMat: '05/01/2005', Tieusungan: 'Vợ ông Nhất.', Loaithanhvien: 'Phụ', HocVi_ChucVu: '', TenThuy: 'Đoan Trang', ViTriMo_QueQuan: 'Khu A' },
  { ID: '5', Hoten: 'Phạm Thị Ba', Gioitinh: 'Nữ', Doithu: 2, ID_Cha: '1', ID_Me: '2', ThuTuCon: 2, NgaySinh: '1922', NgayMat: '12/04/1995', Tieusungan: 'Trưởng nữ. Đảm đang, tháo vát.', Loaithanhvien: 'Chính', HocVi_ChucVu: '', TenThuy: 'Hiền Thục', ViTriMo_QueQuan: 'Làng bên' },
  { ID: '6', Hoten: 'Phạm Văn Trưởng', Gioitinh: 'Nam', Doithu: 3, ID_Cha: '3', ID_Me: '4', ThuTuCon: 1, NgaySinh: '1950', NgayMat: '', Tieusungan: 'Trưởng tôn. Hiện là trưởng tộc, coi sóc nhà thờ họ.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Tiến Sĩ', TenThuy: '', ViTriMo_QueQuan: 'Hà Nội' },
  { ID: '7', Hoten: 'Phạm Văn Thứ', Gioitinh: 'Nam', Doithu: 3, ID_Cha: '3', ID_Me: '4', ThuTuCon: 2, NgaySinh: '1955', NgayMat: '', Tieusungan: 'Con trai thứ. Giáo viên về hưu.', Loaithanhvien: 'Chính', HocVi_ChucVu: '', TenThuy: '', ViTriMo_QueQuan: 'Hà Nội' },
  { ID: '8', Hoten: 'Phạm Văn Chắt', Gioitinh: 'Nam', Doithu: 4, ID_Cha: '6', ID_Me: null, ThuTuCon: 1, NgaySinh: '1980', NgayMat: '', Tieusungan: 'Đích tôn đời thứ 4. Kỹ sư phần mềm.', Loaithanhvien: 'Chính', HocVi_ChucVu: 'Giám Đốc', TenThuy: '', ViTriMo_QueQuan: 'TP.HCM' },
];

export function useFamilyData() {
  const [data, setData] = useState<SheetMember[]>([]);
  const [events, setEvents] = useState<ClanEvent[]>([]);
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
        
        // Xử lý dữ liệu từ Tab Danhsach
        const rawMembers = result.Danhsach || result.data || (Array.isArray(result) ? result : []);
        if (Array.isArray(rawMembers) && rawMembers.length > 0) {
          const mappedData: SheetMember[] = rawMembers.map((m: any) => {
            const findVal = (obj: any, keywords: string[]) => {
              for (const key in obj) {
                const kl = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (keywords.every(kw => kl.includes(kw))) {
                  return obj[key];
                }
              }
              return undefined;
            };

            return {
              ID: String(findVal(m, ['id']) || m.ID || ''),
              Hoten: String(findVal(m, ['hoten']) || m.Hoten || ''),
              Gioitinh: String(findVal(m, ['gioitinh']) || m.Gioitinh || ''),
              Doithu: Number(findVal(m, ['doithu']) || m.Doithu || 0),
              ID_Cha: String(findVal(m, ['idcha']) || m.ID_Cha || '') || null,
              ID_Me: String(findVal(m, ['idme']) || m.ID_Me || '') || null,
              ThuTuCon: Number(findVal(m, ['thutucon']) || m.ThuTuCon || 0),
              NgaySinh: String(findVal(m, ['ngaysinh']) || m.NgaySinh || ''),
              // Ưu tiên 'NgayMat (Âm lịch)' theo yêu cầu
              NgayMat: String(m['NgayMat (Âm lịch)'] || findVal(m, ['ngay', 'mat', 'am']) || findVal(m, ['ngay', 'mat']) || m.NgayMat || ''),
              Tieusungan: String(findVal(m, ['tieusungan']) || m.Tieusungan || ''),
              Loaithanhvien: String(findVal(m, ['loaithanhvien']) || m.Loaithanhvien || ''),
              HocVi_ChucVu: String(findVal(m, ['hocvi']) || findVal(m, ['chucvu']) || m.HocVi_ChucVu || ''),
              TenThuy: String(findVal(m, ['tenthuy']) || m.TenThuy || ''),
              ViTriMo_QueQuan: String(findVal(m, ['vitrimo']) || findVal(m, ['quequan']) || findVal(m, ['diachi']) || m.ViTriMo_QueQuan || m.DiaChi_HienTai || ''),
              HoTen_VoChong: String(findVal(m, ['vochong']) || m.HoTen_VoChong || ''),
              SDT_LienHe: String(findVal(m, ['sdt']) || findVal(m, ['lienhe']) || m.SDT_LienHe || ''),
            };
          });
          setData(mappedData);
        }

        // Xử lý dữ liệu từ Tab Event
        const rawEvents = result.Event || [];
        if (Array.isArray(rawEvents)) {
          const mappedEvents: ClanEvent[] = rawEvents.map((e: any, idx: number) => {
            const findVal = (obj: any, keywords: string[]) => {
              for (const key in obj) {
                const kl = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (keywords.every(kw => kl.includes(kw))) {
                  return obj[key];
                }
              }
              return undefined;
            };

            const loai = String(findVal(e, ['loai', 'su', 'kien']) || e.LoaiSuKien || 'CoDinh');
            return {
              ID: String(e.ID || idx),
              TenSuKien: String(findVal(e, ['ten', 'su', 'kien']) || e.TenSuKien || ''),
              NgayDienRa: String(findVal(e, ['ngay', 'dien', 'ra']) || e.NgayDienRa || ''),
              LoaiSuKien: (loai === 'LinhHoat' || loai === 'Gio') ? loai : 'CoDinh',
              GhiChu: String(findVal(e, ['ghi', 'chu']) || e.GhiChu || ''),
              isLunar: loai !== 'LinhHoat' // Mặc định là âm lịch cho CoDinh và Gio
            };
          });
          setEvents(mappedEvents);
        }

        if (data.length === 0 && (!rawMembers || rawMembers.length === 0)) {
           // Nếu không có dữ liệu thành viên, dùng mock
           setData(MOCK_DATA);
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
    return Array.from(gens).sort((a: number, b: number) => a - b);
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
    // Ưu tiên dùng cột HoTen_VoChong nếu có
    if (member.HoTen_VoChong) return member.HoTen_VoChong;

    // Cách 1: Tìm qua con chung
    const children = data.filter(m => m.ID_Cha === member.ID || m.ID_Me === member.ID);
    for (const child of children) {
      const spouseId = child.ID_Cha === member.ID ? child.ID_Me : child.ID_Cha;
      if (spouseId) {
        const spouse = data.find(m => m.ID === spouseId);
        if (spouse) return spouse.Hoten;
      }
    }
    
    return 'Chưa cập nhật';
  };

  return { data, events, treeData, generations, loading, error, getParents, getSpouse };
}
