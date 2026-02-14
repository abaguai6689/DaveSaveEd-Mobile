import { useState } from 'react'
import { 
  Coins, 
  Gem, 
  Flame, 
  Users, 
  ShoppingBasket, 
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'
import { 
  SaveData, 
  CurrencyValues, 
  setGold, 
  setBei, 
  setArtisansFlame, 
  setFollowerCount,
  maxOwnIngredients,
  maxAllIngredients
} from '../core/saveEditor'

interface SaveEditorProps {
  saveData: SaveData
  setSaveData: (data: SaveData) => void
  currencyValues: CurrencyValues
}

interface EditValue {
  gold: string
  bei: string
  flame: string
  followers: string
}

export function SaveEditor({ saveData, setSaveData, currencyValues }: SaveEditorProps) {
  const [editValues, setEditValues] = useState<EditValue>({
    gold: currencyValues.gold.toString(),
    bei: currencyValues.bei.toString(),
    flame: currencyValues.flame.toString(),
    followers: currencyValues.followers.toString(),
  })
  
  const [expandedSection, setExpandedSection] = useState<string | null>('currency')
  const [showMaxConfirm, setShowMaxConfirm] = useState(false)

  const handleValueChange = (field: keyof EditValue, value: string) => {
    // 只允许数字输入
    if (value !== '' && !/^\d+$/.test(value)) return
    
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyChanges = () => {
    const newData = { ...saveData }
    
    setGold(newData, parseInt(editValues.gold) || 0)
    setBei(newData, parseInt(editValues.bei) || 0)
    setArtisansFlame(newData, parseInt(editValues.flame) || 0)
    setFollowerCount(newData, parseInt(editValues.followers) || 0)
    
    setSaveData(newData)
  }

  const handleMaxCurrency = () => {
    setEditValues({
      gold: '999999999',
      bei: '999999999',
      flame: '999999',
      followers: '99999',
    })
  }

  const handleMaxOwnIngredients = () => {
    const newData = { ...saveData }
    maxOwnIngredients(newData)
    setSaveData(newData)
    alert('已有食材数量已最大化！')
  }

  const handleMaxAllIngredients = () => {
    const newData = { ...saveData }
    maxAllIngredients(newData)
    setSaveData(newData)
    alert('所有食材数量已最大化！')
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const CurrencyInput = ({ 
    icon: Icon, 
    label, 
    value, 
    field,
    colorClass,
    maxValue 
  }: { 
    icon: React.ElementType
    label: string
    value: string
    field: keyof EditValue
    colorClass: string
    maxValue: number
  }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <label className="text-xs text-slate-400 block">{label}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => handleValueChange(field, e.target.value)}
          onBlur={applyChanges}
          className="w-full bg-transparent text-white font-mono text-lg focus:outline-none"
          placeholder="0"
        />
      </div>
      <button
        onClick={() => handleValueChange(field, maxValue.toString())}
        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
      >
        MAX
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* 货币修改 */}
      <div className="card">
        <button
          onClick={() => toggleSection('currency')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">货币修改</h3>
          </div>
          {expandedSection === 'currency' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSection === 'currency' && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <CurrencyInput
              icon={Coins}
              label="金币 (Gold)"
              value={editValues.gold}
              field="gold"
              colorClass="bg-yellow-500/20 text-yellow-400"
              maxValue={999999999}
            />
            <CurrencyInput
              icon={Gem}
              label="贝币 (Bei)"
              value={editValues.bei}
              field="bei"
              colorClass="bg-cyan-500/20 text-cyan-400"
              maxValue={999999999}
            />
            <CurrencyInput
              icon={Flame}
              label="工匠之火"
              value={editValues.flame}
              field="flame"
              colorClass="bg-orange-500/20 text-orange-400"
              maxValue={999999}
            />
            <CurrencyInput
              icon={Users}
              label="粉丝数"
              value={editValues.followers}
              field="followers"
              colorClass="bg-pink-500/20 text-pink-400"
              maxValue={99999}
            />
            
            <button
              onClick={handleMaxCurrency}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              一键最大化所有货币
            </button>
          </div>
        )}
      </div>

      {/* 食材修改 */}
      <div className="card">
        <button
          onClick={() => toggleSection('ingredients')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <ShoppingBasket className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">食材修改</h3>
          </div>
          {expandedSection === 'ingredients' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSection === 'ingredients' && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <button
              onClick={handleMaxOwnIngredients}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              最大化已有食材
            </button>
            <p className="text-xs text-slate-500 text-center">
              将背包中已有食材数量设为最大值
            </p>
            
            <button
              onClick={handleMaxAllIngredients}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              添加所有食材
            </button>
            <p className="text-xs text-slate-500 text-center">
              解锁所有食材并设为最大数量
            </p>
          </div>
        )}
      </div>

      {/* 当前数值显示 */}
      <div className="card">
        <h3 className="text-sm font-bold text-slate-400 mb-3">当前数值预览</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <p className="text-xs text-slate-500">金币</p>
            <p className="text-lg font-mono text-yellow-400">
              {parseInt(editValues.gold || '0').toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <p className="text-xs text-slate-500">贝币</p>
            <p className="text-lg font-mono text-cyan-400">
              {parseInt(editValues.bei || '0').toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <p className="text-xs text-slate-500">工匠之火</p>
            <p className="text-lg font-mono text-orange-400">
              {parseInt(editValues.flame || '0').toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <p className="text-xs text-slate-500">粉丝数</p>
            <p className="text-lg font-mono text-pink-400">
              {parseInt(editValues.followers || '0').toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
