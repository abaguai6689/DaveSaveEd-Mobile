/**
 * Dave the Diver 存档编辑器核心模块
 * 移植自 Python 版本的 encdec.py
 */

// XOR 加密密钥
const XOR_KEY = new TextEncoder().encode('GameData');

// 问题字段触发器 (FarmAnimal字段会导致XOR密钥失步)
const TROUBLESOME_TRIGGERS: Uint8Array[] = [
  new TextEncoder().encode('"FarmAnimal":[{"FarmAnimalID":11090001,"Name":"'),
];

// 字段结束标记
const END_MARKER = new TextEncoder().encode('"}],');

// BYPASS 标记前缀
const BYPASS_PREFIX = "BYPASSED_HEX::";

/**
 * 对字节数组进行XOR加密/解密
 */
function xorBytes(dataBytes: Uint8Array, keyStartIndex: number = 0): Uint8Array {
  const keyLen = XOR_KEY.length;
  const result = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ XOR_KEY[(keyStartIndex + i) % keyLen];
  }
  
  return result;
}

/**
 * 查找子数组在数组中的位置
 */
function findSubArray(haystack: Uint8Array, needle: Uint8Array): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * 检查数组是否以指定子数组结尾
 */
function endsWith(haystack: Uint8Array, needle: Uint8Array): boolean {
  if (haystack.length < needle.length) return false;
  for (let i = 0; i < needle.length; i++) {
    if (haystack[haystack.length - needle.length + i] !== needle[i]) return false;
  }
  return true;
}

/**
 * 查找问题字段的详细信息
 * @returns [fieldLen, resyncKeyIdx] 或 [null, null]
 */
function findFieldDetails(
  encryptedBytes: Uint8Array, 
  startPos: number
): [number | null, number | null] {
  const keyLen = XOR_KEY.length;
  
  if (startPos >= encryptedBytes.length) {
    return [null, null];
  }
  
  // 第一阶段：查找字段长度
  let fieldLen: number | null = null;
  const sliceForLenCheck = encryptedBytes.slice(startPos);
  
  for (let offsetPass1 = 0; offsetPass1 < keyLen; offsetPass1++) {
    const tempKeyIdx = (startPos + offsetPass1) % keyLen;
    const decryptedSlice = xorBytes(sliceForLenCheck, tempKeyIdx);
    const markerPos = findSubArray(decryptedSlice, END_MARKER);
    
    if (markerPos !== -1) {
      fieldLen = markerPos;
      break;
    }
  }
  
  if (fieldLen === null) {
    return [null, null];
  }
  
  // 第二阶段：验证下一个密钥
  const resyncPos = startPos + fieldLen;
  if (resyncPos >= encryptedBytes.length) {
    return [null, null];
  }
  
  const sliceLen = Math.min(50, encryptedBytes.length - resyncPos);
  const sliceForOffsetCheck = encryptedBytes.slice(resyncPos, resyncPos + sliceLen);
  
  for (let offsetPass2 = 0; offsetPass2 < keyLen; offsetPass2++) {
    const tempKeyIdx = (resyncPos + offsetPass2) % keyLen;
    const decryptedSlice = xorBytes(sliceForOffsetCheck, tempKeyIdx);
    
    if (decryptedSlice.length >= END_MARKER.length) {
      let matches = true;
      for (let i = 0; i < END_MARKER.length; i++) {
        if (decryptedSlice[i] !== END_MARKER[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return [fieldLen, tempKeyIdx];
      }
    }
  }
  
  return [fieldLen, null];
}

/**
 * 将字节数组转换为十六进制字符串
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 将十六进制字符串转换为字节数组
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * 解码 .sav 文件为 JSON 字符串
 */
export function decodeSavToJson(encryptedBytes: Uint8Array): string {
  const outputBuffer: number[] = [];
  let dataIdx = 0;
  let keyIdx = 0;
  const keyLen = XOR_KEY.length;
  
  while (dataIdx < encryptedBytes.length) {
    const decryptedByte = encryptedBytes[dataIdx] ^ XOR_KEY[keyIdx % keyLen];
    outputBuffer.push(decryptedByte);
    
    let triggerFound = false;
    const outputArray = new Uint8Array(outputBuffer);
    
    for (const trigger of TROUBLESOME_TRIGGERS) {
      if (endsWith(outputArray, trigger)) {
        const fieldStartPos = dataIdx + 1;
        const [length, newKeyIdx] = findFieldDetails(encryptedBytes, fieldStartPos);
        
        if (length !== null && newKeyIdx !== null) {
          const fieldBytes = encryptedBytes.slice(fieldStartPos, fieldStartPos + length);
          
          // 移除触发器，重新添加，然后添加bypass标记
          outputBuffer.splice(outputBuffer.length - trigger.length, trigger.length);
          for (const b of trigger) outputBuffer.push(b);
          
          const bypassString = `${BYPASS_PREFIX}${bytesToHex(fieldBytes)}:${newKeyIdx}`;
          for (let i = 0; i < bypassString.length; i++) {
            outputBuffer.push(bypassString.charCodeAt(i));
          }
          
          dataIdx = fieldStartPos + length;
          keyIdx = newKeyIdx;
          triggerFound = true;
        }
        break;
      }
    }
    
    if (!triggerFound) {
      dataIdx++;
      keyIdx++;
    }
  }
  
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(outputBuffer));
}

/**
 * 编码 JSON 字符串为 .sav 格式
 */
export function encodeJsonToSav(jsonString: string): Uint8Array {
  // 压缩JSON（移除多余空格）
  const compactJson = JSON.stringify(JSON.parse(jsonString));
  
  const outputBytes: number[] = [];
  let keyIdx = 0;
  const keyLen = XOR_KEY.length;
  
  // 匹配 BYPASS 标记的正则表达式
  const pattern = new RegExp(`${BYPASS_PREFIX}([a-fA-F0-9]+):(\\d+)`, 'g');
  let match: RegExpExecArray | null;
  let lastEnd = 0;
  
  while ((match = pattern.exec(compactJson)) !== null) {
    const start = match.index;
    
    // 加密bypass之前的正常部分
    const cleanPartStr = compactJson.slice(lastEnd, start);
    const cleanPartBytes = new TextEncoder().encode(cleanPartStr);
    const encryptedClean = xorBytes(cleanPartBytes, keyIdx);
    
    for (const b of encryptedClean) outputBytes.push(b);
    keyIdx = (keyIdx + cleanPartBytes.length) % keyLen;
    
    // 直接插入bypass的原始字节
    const hexData = match[1];
    const newKeyIdx = parseInt(match[2], 10);
    const rawFieldBytes = hexToBytes(hexData);
    
    for (const b of rawFieldBytes) outputBytes.push(b);
    keyIdx = newKeyIdx;
    
    lastEnd = start + match[0].length;
  }
  
  // 加密剩余部分
  const remainingPartStr = compactJson.slice(lastEnd);
  const remainingPartBytes = new TextEncoder().encode(remainingPartStr);
  const encryptedRemaining = xorBytes(remainingPartBytes, keyIdx);
  
  for (const b of encryptedRemaining) outputBytes.push(b);
  
  return new Uint8Array(outputBytes);
}

// ==================== 存档数据操作 ====================

export interface SaveData {
  PlayerInfo?: {
    m_Gold?: number;
    m_Bei?: number;
    m_ChefFlame?: number;
    [key: string]: unknown;
  };
  SNSInfo?: {
    m_Follow_Count?: number;
    [key: string]: unknown;
  };
  Ingredients?: Record<string, {
    ingredientsID: number;
    count: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CurrencyValues {
  gold: number;
  bei: number;
  flame: number;
  followers: number;
}

/**
 * 从存档数据中获取货币值
 */
export function getCurrencyValues(data: SaveData): CurrencyValues {
  return {
    gold: data.PlayerInfo?.m_Gold ?? 0,
    bei: data.PlayerInfo?.m_Bei ?? 0,
    flame: data.PlayerInfo?.m_ChefFlame ?? 0,
    followers: data.SNSInfo?.m_Follow_Count ?? 0,
  };
}

/**
 * 设置金币
 */
export function setGold(data: SaveData, value: number): void {
  if (!data.PlayerInfo) data.PlayerInfo = {};
  data.PlayerInfo.m_Gold = Math.min(value, 999999999);
}

/**
 * 设置贝币
 */
export function setBei(data: SaveData, value: number): void {
  if (!data.PlayerInfo) data.PlayerInfo = {};
  data.PlayerInfo.m_Bei = Math.min(value, 999999999);
}

/**
 * 设置工匠之火
 */
export function setArtisansFlame(data: SaveData, value: number): void {
  if (!data.PlayerInfo) data.PlayerInfo = {};
  data.PlayerInfo.m_ChefFlame = Math.min(value, 999999);
}

/**
 * 设置粉丝数
 */
export function setFollowerCount(data: SaveData, value: number): void {
  if (!data.SNSInfo) data.SNSInfo = {};
  data.SNSInfo.m_Follow_Count = value;
}

/**
 * 最大化已有食材
 */
export function maxOwnIngredients(data: SaveData): void {
  if (!data.Ingredients) return;
  
  for (const key in data.Ingredients) {
    const item = data.Ingredients[key];
    if (item && typeof item.count === 'number') {
      // 根据ID范围设置不同的最大值
      const id = item.ingredientsID;
      let maxCount = 99;
      
      if (id >= 1015000 && id < 1016000) {
        // 矿石类
        maxCount = 999;
      } else if (id >= 1016000 && id < 1017000) {
        // 调料类
        maxCount = 999;
      } else if (id >= 1017000 && id < 1018000) {
        // 蔬菜类
        maxCount = 999;
      } else if (id >= 1011000 && id < 1012000) {
        // 鱼类
        maxCount = 99;
      }
      
      item.count = maxCount;
    }
  }
}

/**
 * 添加所有食材（简化版）
 */
export function maxAllIngredients(data: SaveData): void {
  if (!data.Ingredients) data.Ingredients = {};
  
  // 这里简化处理，只最大化已有食材
  // 完整实现需要物品数据库
  maxOwnIngredients(data);
}

/**
 * 生成备份文件名
 */
export function generateBackupFileName(originalName: string): string {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  
  const baseName = originalName.replace(/\.sav$/i, '');
  return `${baseName}_${timestamp}.sav`;
}

/**
 * 将 Uint8Array 转换为 Base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 将 Base64 转换为 Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
