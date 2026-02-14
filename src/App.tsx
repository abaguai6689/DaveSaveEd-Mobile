import { useState, useEffect } from 'react'
import { SaveEditor } from './components/SaveEditor'
import { FileUploader } from './components/FileUploader'
import { decodeSavToJson, encodeJsonToSav, SaveData, getCurrencyValues } from './core/saveEditor'
import { Fish, FolderOpen, Save, AlertCircle, CheckCircle } from 'lucide-react'

type AppStatus = 'idle' | 'loading' | 'success' | 'error'

interface StatusMessage {
  type: AppStatus
  message: string
}

function App() {
  const [saveData, setSaveData] = useState<SaveData | null>(null)
  const [originalFileName, setOriginalFileName] = useState<string>('')
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null)
  const [status, setStatus] = useState<StatusMessage | null>(null)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    // 检测是否在原生应用中运行
    const checkNative = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isCapacitor = typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined'
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsNative(isCapacitor || isMobile)
    }
    checkNative()
  }, [])

  const handleFileLoad = (fileName: string, bytes: Uint8Array) => {
    try {
      setStatus({ type: 'loading', message: '正在解码存档文件...' })
      
      // 解码存档
      const jsonStr = decodeSavToJson(bytes)
      const data = JSON.parse(jsonStr) as SaveData
      
      setSaveData(data)
      setOriginalFileName(fileName)
      setOriginalBytes(bytes)
      setStatus({ type: 'success', message: `成功加载: ${fileName}` })
      
      // 3秒后清除状态消息
      setTimeout(() => setStatus(null), 3000)
    } catch (error) {
      console.error('解码失败:', error)
      setStatus({ 
        type: 'error', 
        message: `解码失败: ${error instanceof Error ? error.message : '未知错误'}` 
      })
    }
  }

  const handleSave = () => {
    if (!saveData || !originalFileName) return
    
    try {
      setStatus({ type: 'loading', message: '正在保存存档...' })
      
      // 编码回.sav格式
      const jsonStr = JSON.stringify(saveData)
      const encodedBytes = encodeJsonToSav(jsonStr)
      
      // 创建下载
      const blob = new Blob([encodedBytes], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setStatus({ type: 'success', message: '存档已保存!' })
      setTimeout(() => setStatus(null), 3000)
    } catch (error) {
      console.error('保存失败:', error)
      setStatus({ 
        type: 'error', 
        message: `保存失败: ${error instanceof Error ? error.message : '未知错误'}` 
      })
    }
  }

  const handleClear = () => {
    setSaveData(null)
    setOriginalFileName('')
    setOriginalBytes(null)
    setStatus(null)
  }

  const currencyValues = saveData ? getCurrencyValues(saveData) : null

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DaveSaveEd</h1>
                <p className="text-xs text-slate-400">潜水员戴夫存档修改器</p>
              </div>
            </div>
            {isNative && (
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                App模式
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 状态栏 */}
      {status && (
        <div className={`max-w-lg mx-auto px-4 mt-4 animate-fade-in`}>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            status.type === 'loading' ? 'bg-blue-500/20 text-blue-400' :
            status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
            status.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
            'bg-slate-700/50 text-slate-300'
          }`}>
            {status.type === 'loading' && (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm">{status.message}</span>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 文件上传区域 */}
        {!saveData && (
          <section className="animate-fade-in">
            <FileUploader onFileLoad={handleFileLoad} />
          </section>
        )}

        {/* 已加载文件信息 */}
        {saveData && originalFileName && (
          <section className="card animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">已加载文件</p>
                  <p className="text-white font-medium truncate max-w-[200px]">
                    {originalFileName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="关闭文件"
              >
                <span className="text-slate-400 hover:text-rose-400">✕</span>
              </button>
            </div>
          </section>
        )}

        {/* 存档编辑器 */}
        {saveData && (
          <section className="animate-fade-in">
            <SaveEditor 
              saveData={saveData}
              setSaveData={setSaveData}
              currencyValues={currencyValues!}
            />
          </section>
        )}

        {/* 保存按钮 */}
        {saveData && (
          <section className="animate-fade-in">
            <button
              onClick={handleSave}
              className="w-full btn-success flex items-center justify-center gap-2 py-4 text-lg font-bold shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-5 h-5" />
              保存修改
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              原始文件将自动备份
            </p>
          </section>
        )}

        {/* 使用说明 */}
        {!saveData && (
          <section className="card animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4">使用说明</h2>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>点击上方按钮选择 .sav 存档文件</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>修改金币、贝币、工匠之火等数值</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>点击"保存修改"下载修改后的存档</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>将修改后的存档覆盖原文件</span>
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">
                <strong>提示：</strong> 存档位置通常在：<br/>
                Android: /Android/data/...<br/>
                建议修改前先备份原存档
              </p>
            </div>
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <p className="text-center text-xs text-slate-500">
            DaveSaveEd Mobile v1.0.0 | 非官方工具
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
