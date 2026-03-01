import { Lunar, Solar } from 'lunar-javascript';

/**
 * Chuyển đổi ngày âm lịch sang ngày dương lịch tương ứng của năm hiện tại.
 * @param lunarDay Ngày âm lịch (1-30)
 * @param lunarMonth Tháng âm lịch (1-12)
 * @param currentYear Năm hiện tại (ví dụ: 2026)
 * @returns Đối tượng Date dương lịch
 */
export function getSolarDate(lunarDay: number, lunarMonth: number, currentYear: number): Date {
  try {
    const lunar = Lunar.fromYmd(currentYear, lunarMonth, lunarDay);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch (error) {
    console.error('Lỗi khi chuyển đổi ngày âm lịch:', error);
    return new Date();
  }
}

/**
 * Phân tích chuỗi ngày âm lịch (DD/MM hoặc DD/MM/YYYY) thành các thành phần số.
 */
export function parseLunarDate(lunarDateStr: any): { day: number, month: number, year?: number } | null {
  if (!lunarDateStr) return null;
  
  let str = String(lunarDateStr).trim();
  
  // Nếu là số (serial date từ Excel/Sheets)
  if (!isNaN(Number(str)) && Number(str) > 10000) {
    const d = new Date((Number(str) - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) {
      return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
    }
  }
  
  // Nếu là định dạng ISO (YYYY-MM-DD...) hoặc định dạng toString() của Date
  if ((str.includes('T') && str.includes('-')) || (str.includes(' ') && str.includes(':'))) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
    }
  }

  // Thử parse các định dạng phổ biến: DD/MM/YYYY, DD/MM, DD-MM-YYYY, DD-MM
  const parts = str.split(/[\/\-\s\.]/);
  if (parts.length < 2) return null;

  // Trường hợp YYYY-MM-DD (nếu split ra 3 phần và phần đầu có 4 chữ số)
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month)) return { day, month, year };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parts.length >= 3 ? parseInt(parts[2], 10) : undefined;

  if (isNaN(day) || isNaN(month)) return null;
  // Chấp nhận ngày tháng cơ bản
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return { day, month, year };
}

/**
 * Lấy ngày dương lịch của ngày giỗ trong một năm cụ thể (mặc định là năm hiện tại).
 */
export function getAnniversarySolarDate(lunarDateStr: string, year?: number): Date | null {
  const parsed = parseLunarDate(lunarDateStr);
  if (!parsed) return null;

  const targetYear = year || new Date().getFullYear();
  return getSolarDate(parsed.day, parsed.month, targetYear);
}

/**
 * Định dạng ngày dương lịch sang chuỗi DD/MM/YYYY
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày dương lịch sang chuỗi DD/MM (không có năm)
 */
export function formatShortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Kiểm tra xem một ngày có nằm trong khoảng N ngày tới hay không.
 */
export function isWithinNextNDays(date: Date, n: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  // Nếu ngày đã qua trong năm nay, nó không nằm trong "N ngày tới" (trừ khi tính cho năm sau, nhưng ở đây ta tính trong năm hiện tại)
  if (target < today) return false;
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= n;
}

/**
 * Kiểm tra xem một ngày âm lịch có phải là ngày hôm nay (âm lịch) hay không
 */
export function isLunarToday(lunarDay: number, lunarMonth: number): boolean {
  const todaySolar = Solar.fromDate(new Date());
  const todayLunar = todaySolar.getLunar();
  return todayLunar.getDay() === lunarDay && todayLunar.getMonth() === lunarMonth;
}
