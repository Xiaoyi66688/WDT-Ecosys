/**
 * Xano API 配置
 * 
 * 使用說明：
 * 1. 在 Xano 後台獲取您的 API Base URL
 * 2. 將 Base URL 設置為環境變數 NEXT_PUBLIC_XANO_API_URL
 * 3. 如果需要 API Key，請設置 NEXT_PUBLIC_XANO_API_KEY
 * 
 * 環境變數設置方式：
 * 在專案根目錄創建 .env.local 文件，添加：
 * NEXT_PUBLIC_XANO_API_URL=https://your-instance.xano.net/api:api_version
 * NEXT_PUBLIC_XANO_API_KEY=your_api_key (如果需要)
 */

export const XANO_CONFIG = {
  // Xano API Base URLs - 根據 API Group ID 映射
  // 327394: Authentication
  // 327772: Ecosystem Map (主要用於前端)
  // 327396: Event Logs
  // 327395: Members & Accounts
  baseURLs: {
    // Ecosystem Map API Group (#327772) - 主要用於資料庫、地圖、表單提交
    ecosystem: process.env.NEXT_PUBLIC_XANO_API_URL_ECOSYSTEM || 'https://x8ki-letl-twmt.n7.xano.io/api:624R4fXU',
    
    // Authentication API Group (#327394) - 用於用戶認證
    auth: process.env.NEXT_PUBLIC_XANO_API_URL_AUTH || 'https://x8ki-letl-twmt.n7.xano.io/api:Ct01qzmm',
    
    // Event Logs API Group (#327396) - 用於事件日誌
    eventLogs: process.env.NEXT_PUBLIC_XANO_API_URL_LOGS || 'https://x8ki-letl-twmt.n7.xano.io/api:P-CMGhgu',
    
    // Members & Accounts API Group (#327395) - 用於成員和帳戶管理
    members: process.env.NEXT_PUBLIC_XANO_API_URL_MEMBERS || 'https://x8ki-letl-twmt.n7.xano.io/api:4IZvV5c9',
  },
  
  // API Key (如果需要)
  apiKey: process.env.NEXT_PUBLIC_XANO_API_KEY || '',
};

/**
 * 獲取完整的 API URL
 * @param endpoint - API endpoint 路徑（例如：'/Get_all_organisations'）
 * @param apiGroup - 使用哪個 API Group（默認為 'ecosystem'）
 */
export function getApiUrl(
  endpoint: string, 
  apiGroup: 'ecosystem' | 'auth' | 'eventLogs' | 'members' = 'ecosystem'
): string {
  const baseURL = XANO_CONFIG.baseURLs[apiGroup];
  if (!baseURL) {
    throw new Error(`Xano API URL (${apiGroup}) 未設置`);
  }
  // 如果 endpoint 已經包含完整 URL，直接返回
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  // 確保 endpoint 以 / 開頭
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${cleanEndpoint}`;
}

/**
 * 獲取 API 請求標頭
 */
export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (XANO_CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${XANO_CONFIG.apiKey}`;
  }
  
  return headers;
}

