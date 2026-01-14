/**
 * Xano API 服務封裝
 * 
 * 這個文件包含了所有與 Xano 後端通信的 API 函數
 */

import axios from 'axios';
import { getApiUrl, getApiHeaders } from './xano-config';

// ============================================================================
// 類型定義
// ============================================================================

export interface Organization {
  id?: string | number;
  name: string;
  description?: string;
  contactPerson?: string;
  role?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  entityType?: string;
  expertise?: string[];
  impactArea?: string[];
  latitude?: number;
  longitude?: number;
  [key: string]: any; // 允許其他字段
}

export interface JoinFormData {
  orgName: string;
  orgDesc: string;
  contactPerson: string;
  role: string;
  website?: string; // 可選字段
  email: string;
  phone: string;
  address: string;
  expertise: string;
  country?: string;
}

export interface ContactFormData {
  name: string;
  organisation: string;
  email: string;
  reason: string;
  comments: string;
}

export interface OptOutFormData {
  orgName: string;
  name: string;
  role: string;
  email: string;
  address: string;
  reason: string;
}

// ============================================================================
// Ecosystem Map API - 資料庫相關操作
// ============================================================================

/**
 * 獲取所有組織列表
 * 使用 Ecosystem Map API Group (#327772) 的 Get_all_organisations endpoint
 */
export async function getOrganizations(): Promise<Organization[]> {
  try {
    const apiUrl = getApiUrl('/Get_all_organisations', 'ecosystem');
    console.log('調用 getOrganizations API:', apiUrl);
    
    const response = await axios.get(
      apiUrl,
      { headers: getApiHeaders() }
    );
    
    console.log('getOrganizations 響應狀態:', response.status);
    console.log('getOrganizations 響應數據:', response.data);
    console.log('響應數據類型:', typeof response.data);
    console.log('響應數據是否為數組:', Array.isArray(response.data));
    
    // Xano 可能返回多種格式：
    // 1. 直接返回數組: [...]
    // 2. 返回對象包含 records: { records: [...] }
    // 3. 返回對象包含變量名: { organisations_cleaned1: [...] }
    // 4. 返回對象包含 result: { result1: [...] }
    const data = response.data;
    let organizations: any[] = [];
    
    if (Array.isArray(data)) {
      // 直接是數組
      organizations = data;
    } else if (data && typeof data === 'object') {
      // 是對象，嘗試多種可能的鍵名
      organizations = data.records || 
                     data.data || 
                     data.organisations_cleaned1 || 
                     data.organisations_cleaned || 
                     data.result1 ||
                     data.result ||
                     (Object.values(data).find((val: any) => Array.isArray(val)) as any[]) || 
                     [];
    }
    
    console.log('解析後的組織數據:', organizations);
    console.log('組織數量:', organizations.length);
    if (organizations.length > 0) {
      console.log('第一個組織示例:', organizations[0]);
    }
    
    return organizations;
  } catch (error: any) {
    console.error('獲取組織列表失敗:', error);
    if (error.response) {
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤響應數據:', error.response.data);
    }
    throw new Error(error.response?.data?.message || '獲取組織列表失敗');
  }
}

/**
 * 根據 ID 獲取單個組織
 * 注意：需要確認是否有此 endpoint，或使用 Get_all_organisations 然後過濾
 */
export async function getOrganizationById(id: string | number): Promise<Organization> {
  try {
    // TODO: 需要確認是否有 GET organisations/{id} endpoint
    // 如果沒有，可以從 getOrganizations() 中過濾
    const response = await axios.get(
      getApiUrl(`/organisations/${id}`, 'ecosystem'), // 臨時路徑，需要確認
      { headers: getApiHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('獲取組織失敗:', error);
    throw new Error(error.response?.data?.message || '獲取組織失敗');
  }
}

/**
 * 創建新組織（Join 表單提交）
 * 注意：需要確認正確的 POST endpoint
 * 在 Ecosystem Map API Group 中可能需要創建 POST organisations endpoint
 */
export async function createOrganization(data: JoinFormData): Promise<Organization> {
  try {
    // 準備發送的數據，包含所有必填字段
    const cleanedData: any = {
      orgName: data.orgName,
      orgDesc: data.orgDesc,
      contactPerson: data.contactPerson,
      role: data.role,
      email: data.email,
      phone: data.phone,
      address: data.address,
      expertise: data.expertise,
    };
    
    // 對於可選字段，如果 Xano 要求必須存在，則發送空字符串或 null
    // 如果 Xano 設置為可選且允許不存在，則不發送
    // 目前先發送空字符串以滿足 Xano 的要求
    cleanedData.website = data.website && data.website.trim() !== '' ? data.website : '';
    if (data.country && data.country.trim() !== '') {
      cleanedData.country = data.country;
    }
    
    // 記錄發送的數據以便調試
    console.log('發送到 Xano 的數據:', cleanedData);
    console.log('API URL:', getApiUrl('/organisations', 'ecosystem'));
    
    const response = await axios.post(
      getApiUrl('/organisations', 'ecosystem'),
      cleanedData,
      { headers: getApiHeaders() }
    );
    
    console.log('Xano 響應:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('創建組織失敗:', error);
    // 顯示更詳細的錯誤訊息
    if (error.response) {
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤響應數據:', error.response.data);
      console.error('錯誤請求數據:', error.config?.data);
    }
    throw new Error(error.response?.data?.message || error.response?.data?.error || '創建組織失敗');
  }
}

/**
 * 更新組織信息
 */
export async function updateOrganization(
  id: string | number,
  data: Partial<Organization>
): Promise<Organization> {
  try {
    const response = await axios.put(
      getApiUrl(`/organisations/${id}`, 'ecosystem'), // 需要確認是否有此 endpoint
      data,
      { headers: getApiHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('更新組織失敗:', error);
    throw new Error(error.response?.data?.message || '更新組織失敗');
  }
}

/**
 * 刪除組織（Opt-out）
 */
export async function deleteOrganization(id: string | number): Promise<void> {
  try {
    await axios.delete(
      getApiUrl(`/organisations/${id}`, 'ecosystem'), // 需要確認是否有此 endpoint
      { headers: getApiHeaders() }
    );
  } catch (error: any) {
    console.error('刪除組織失敗:', error);
    throw new Error(error.response?.data?.message || '刪除組織失敗');
  }
}

// ============================================================================
// Contact API - 聯繫表單
// ============================================================================

/**
 * 提交聯繫表單
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  try {
    console.log('發送到 Xano 的聯繫表單數據:', data);
    console.log('API URL:', getApiUrl('/contact', 'ecosystem'));
    
    const response = await axios.post(
      getApiUrl('/contact', 'ecosystem'),
      data,
      { headers: getApiHeaders() }
    );
    
    console.log('Xano 響應:', response.data);
  } catch (error: any) {
    console.error('提交聯繫表單失敗:', error);
    if (error.response) {
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤響應數據:', error.response.data);
      console.error('錯誤請求數據:', error.config?.data);
    }
    throw new Error(error.response?.data?.message || error.response?.data?.error || '提交聯繫表單失敗');
  }
}

// ============================================================================
// Opt-Out API - 退出表單
// ============================================================================

/**
 * 提交退出請求
 */
export async function submitOptOutRequest(data: OptOutFormData): Promise<void> {
  try {
    // 過濾掉空字符串的可選字段
    const cleanedData: any = {
      orgName: data.orgName,
      name: data.name,
      role: data.role,
      email: data.email,
      reason: data.reason,
    };
    
    // 只添加有值的可選字段
    if (data.address && data.address.trim() !== '') {
      cleanedData.address = data.address;
    } else {
      // 如果 Xano 要求 address 字段必須存在，發送空字符串
      cleanedData.address = '';
    }
    
    console.log('發送到 Xano 的退出請求數據:', cleanedData);
    console.log('API URL:', getApiUrl('/opt-out', 'ecosystem'));
    
    const response = await axios.post(
      getApiUrl('/opt-out', 'ecosystem'),
      cleanedData,
      { headers: getApiHeaders() }
    );
    
    console.log('Xano 響應:', response.data);
  } catch (error: any) {
    console.error('提交退出請求失敗:', error);
    if (error.response) {
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤響應數據:', error.response.data);
      console.error('錯誤請求數據:', error.config?.data);
    }
    throw new Error(error.response?.data?.message || error.response?.data?.error || '提交退出請求失敗');
  }
}

// ============================================================================
// Statistics API - 統計數據
// ============================================================================

/**
 * 獲取生態系統統計數據
 * 從組織列表計算統計數據（因為沒有專用的 stats endpoint）
 */
export async function getEcosystemStats(): Promise<{
  totalEntities: number;
  totalExpertise: number;
  totalRegions: number;
}> {
  try {
    // 直接從組織列表計算統計數據
    const organizations = await getOrganizations();
    const expertiseSet = new Set<string>();
    
    organizations.forEach(org => {
      const expertise = Array.isArray(org.expertise) 
        ? org.expertise 
        : (org.expertise ? [org.expertise] : []);
      expertise.forEach(exp => expertiseSet.add(exp));
    });
    
    return {
      totalEntities: organizations.length,
      totalExpertise: expertiseSet.size,
      totalRegions: 1, // Waikato region
    };
  } catch (calcError) {
    console.error('計算統計數據失敗:', calcError);
    // 返回默認值
    return {
      totalEntities: 0,
      totalExpertise: 0,
      totalRegions: 1,
    };
  }
}

// ============================================================================
// Map API - 地圖標記數據
// ============================================================================

/**
 * 獲取地圖標記數據（包含經緯度）
 * 使用 Get_all_organisations endpoint，但只返回包含經緯度的組織
 * 注意：如果遇到速率限制，可以重用 getOrganizations 的結果
 */
export async function getMapMarkers(): Promise<Organization[]> {
  try {
    const apiUrl = getApiUrl('/Get_all_organisations', 'ecosystem');
    console.log('調用 getMapMarkers API:', apiUrl);
    
    const response = await axios.get(
      apiUrl,
      { headers: getApiHeaders() }
    );
    
    console.log('getMapMarkers 響應狀態:', response.status);
    
    // Xano 可能返回多種格式
    const data = response.data;
    let organizations: any[] = [];
    
    if (Array.isArray(data)) {
      organizations = data;
    } else if (data && typeof data === 'object') {
      organizations = data.records || 
                     data.data || 
                     data.organisations_cleaned1 || 
                     data.organisations_cleaned || 
                     data.result1 ||
                     data.result ||
                     (Object.values(data).find((val: any) => Array.isArray(val)) as any[]) || 
                     [];
    }
    
    // 過濾出有經緯度的組織
    // 注意：Xano 可能使用不同的字段名稱，如 lat/lng, latitude/longitude 等
    const markers = organizations.filter((org: any) => {
      // 支持多種經緯度字段格式
      const lat = org.latitude || org.lat || (org as any).location?.latitude;
      const lng = org.longitude || org.lng || (org as any).location?.longitude;
      return lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
    });
    
    console.log('過濾後的地圖標記數量:', markers.length);
    return markers;
  } catch (error: any) {
    console.error('獲取地圖標記失敗:', error);
    
    // 處理速率限制錯誤（429）
    if (error.response?.status === 429) {
      const rateLimitMessage = error.response?.data?.message || 
                               'API 請求速率限制：您的方案每 20 秒只支持 10 個請求。請稍後再試或升級方案。';
      throw new Error(rateLimitMessage);
    }
    
    // 處理其他錯誤
    throw new Error(error.response?.data?.message || error.message || '獲取地圖標記失敗');
  }
}

