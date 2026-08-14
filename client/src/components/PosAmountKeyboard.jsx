import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';
import { SettingOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

const DEF_STATIC = [10000, 20000, 50000, 100000];
const DEF_MULTI  = [1000, 10000, 100000, 1000000];

function getSettings(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
function setSettings(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export default function PosAmountKeyboard({ open, value, onOk, onCancel, title = 'NHẬP SỐ TIỀN', unit = 'VNĐ' }) {
  const [valStr, setValStr] = useState('');
  const [isSettings, setIsSettings] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  
  // Settings State
  const [statics, setStatics] = useState(DEF_STATIC);
  const [multis, setMultis] = useState(DEF_MULTI);
  const [settingInput, setSettingInput] = useState('');

  useEffect(() => {
    if (open) {
      setValStr(value ? String(value) : '');
      setIsSettings(false);
      setStatics(getSettings('appsheet_kb_static', DEF_STATIC));
      setMultis(getSettings('appsheet_kb_multi', DEF_MULTI));
      setSettingInput('');
    }
  }, [open, value]);

  const handleNumpad = (k, isSettingMode = false) => {
    let current = isSettingMode ? settingInput : valStr;
    if (k === 'DEL') {
      current = current.slice(0, -1);
    } else if (k === 'CLEAR') {
      current = '';
    } else if (k === '.') {
      if (!current.includes('.')) {
        current = current === '' ? '0.' : current + '.';
      }
    } else {
      if (current === '0' && k !== '000') current = k;
      else current += k;
    }
    if (current.length > 15) current = current.slice(0, 15);
    
    if (isSettingMode) setSettingInput(current);
    else setValStr(current);
  };

  const handleSuggestClick = (num) => {
    onOk(num);
  };

  const handleOk = () => {
    onOk(Number(valStr || 0));
  };

  const currentNum = Number(valStr || 0);
  const suggestList = (valStr === '' || currentNum === 0) ? statics : multis;
  const baseNum = (valStr === '' || currentNum === 0) ? 1 : currentNum;

  const displayValue = (str) => {
    if (!str) return '0';
    const parts = str.split('.');
    const intPart = new Intl.NumberFormat('vi-VN').format(Number(parts[0]) || 0);
    if (parts.length > 1) {
      return `${intPart},${parts[1]}`;
    }
    return intPart;
  };

  // === RENDER SETTINGS ===
  if (isSettings) {
    return (
      <Modal open={open} footer={null} closable={false} onCancel={() => setIsSettings(false)} width={400} styles={{ padding: 0, body: { padding: 0 } }} modalRender={(node) => <div className="rounded-2xl overflow-hidden shadow-2xl">{node}</div>}>
        <div className="p-4 bg-slate-900 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300 m-0 uppercase">⚙ Cấu hình gợi ý</h3>
            <Button size="small" type="primary" className="bg-emerald-600 border-none font-bold shadow-md shadow-emerald-900/50" onClick={() => setIsSettings(false)}>Xong</Button>
          </div>

          <div className="space-y-4 mb-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">1. Khi rỗng (Gợi ý tĩnh):</div>
              <div className="flex flex-wrap gap-2">
                {statics.map(n => (
                  <div key={n} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md text-xs font-bold border border-slate-700">
                    {formatCurrency(n)}
                    <CloseOutlined className="text-red-400 text-xs cursor-pointer hover:text-red-300" onClick={() => {
                      const nu = statics.filter(x => x !== n);
                      setStatics(nu); setSettings('appsheet_kb_static', nu);
                    }}/>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">2. Khi đã nhập số (Nhân thêm):</div>
              <div className="flex flex-wrap gap-2">
                {multis.map(n => (
                  <div key={n} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md text-xs font-bold border border-slate-700">
                    x {formatCurrency(n)}
                    <CloseOutlined className="text-red-400 text-xs cursor-pointer hover:text-red-300" onClick={() => {
                      const nu = multis.filter(x => x !== n);
                      setMultis(nu); setSettings('appsheet_kb_multi', nu);
                    }}/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-4">
            <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-right text-lg font-bold text-sky-400 overflow-hidden flex items-center justify-end shadow-inner">
              {displayValue(settingInput)}
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 rounded-lg shadow-md shadow-blue-900/50 transition-colors" onClick={() => {
              const n = Number(settingInput);
              if(n > 0 && !statics.includes(n)) {
                const nu = [...statics, n].sort((a,b)=>a-b);
                setStatics(nu); setSettings('appsheet_kb_static', nu);
                setSettingInput('');
              }
            }}>+ Tĩnh</button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 rounded-lg shadow-md shadow-emerald-900/50 transition-colors" onClick={() => {
              const n = Number(settingInput);
              if(n > 0 && !multis.includes(n)) {
                const nu = [...multis, n].sort((a,b)=>a-b);
                setMultis(nu); setSettings('appsheet_kb_multi', nu);
                setSettingInput('');
              }
            }}>+ Nhân</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['7','8','9','4','5','6','1','2','3','0','000','.'].map(k => (
              <button key={k} className="h-12 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-xl rounded-xl active:scale-95 transition-transform shadow-md" onClick={() => handleNumpad(k, true)}>
                {k === '.' ? ',' : k}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  // === RENDER MAIN KEYBOARD ===
  return (
    <Modal open={open} footer={null} closable={false} onCancel={onCancel} width={400} styles={{ padding: 0, body: { padding: 0 } }} modalRender={(node) => <div className="rounded-2xl overflow-hidden shadow-2xl">{node}</div>}>
      <div className="p-5 bg-slate-900 text-white relative border border-slate-700 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</div>
          <div className="flex gap-2">
            <button className="text-xs font-bold text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg bg-slate-800 shadow-sm transition-colors flex items-center gap-2" onClick={async () => {
              try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                  const text = await navigator.clipboard.readText();
                  if (text) {
                    const n = text.replace(/\D/g,'');
                    if(n) {
                      setValStr(n);
                      onOk(Number(n));
                    }
                  }
                } else {
                  setShowPasteModal(true);
                }
              } catch(e) {
                setShowPasteModal(true);
              }
            }}>
              📋 Dán
            </button>
            <button className="text-xs font-bold text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg bg-slate-800 shadow-sm transition-colors flex items-center gap-2" onClick={() => setIsSettings(true)}>
              <SettingOutlined /> Cấu hình
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="bg-slate-950 border-2 border-slate-700/50 rounded-xl px-4 py-3 mb-5 flex justify-between items-center shadow-inner">
          <span className="text-slate-600 font-bold text-sm tracking-wider">{unit}</span>
          <span className="text-4xl font-black text-white overflow-hidden text-right tracking-tight">
            {displayValue(valStr)}
          </span>
        </div>

        {/* Suggestion Bar */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {suggestList.map(n => (
            <button key={n} className="bg-gradient-to-b from-blue-600 to-blue-800 border border-blue-500 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-[11px] h-11 rounded-xl active:scale-95 transition-transform shadow-lg shadow-blue-900/30 overflow-hidden" onClick={() => handleSuggestClick(baseNum * n)}>
              {(baseNum * n).toLocaleString('vi-VN')}
            </button>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-4 gap-2">
          {/* Numbers */}
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {['7','8','9','4','5','6','1','2','3','0','000','.'].map(k => (
              <button key={k} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-2xl h-14 rounded-xl active:scale-95 transition-transform shadow-md" onClick={() => handleNumpad(k, false)}>
                {k === '.' ? ',' : k}
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="col-span-1 flex flex-col gap-2">
            <button className="bg-gradient-to-b from-red-500 to-red-700 border border-red-500 hover:from-red-400 hover:to-red-600 text-white font-bold text-sm rounded-xl active:scale-95 transition-transform h-14 shadow-md shadow-red-900/30 flex items-center justify-center" onClick={() => handleNumpad('CLEAR', false)}>
              XOÁ
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold text-xl rounded-xl active:scale-95 transition-transform h-14 shadow-md flex items-center justify-center" onClick={() => handleNumpad('DEL', false)}>
              <DeleteOutlined className="text-red-400"/>
            </button>
            <button className="bg-gradient-to-b from-emerald-500 to-emerald-700 border border-emerald-500 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-xl rounded-xl active:scale-95 transition-transform flex-1 shadow-lg shadow-emerald-900/30 flex items-center justify-center" onClick={handleOk}>
              OK
            </button>
          </div>
        </div>

      </div>

      <Modal 
        open={showPasteModal} 
        footer={null} 
        closable={false} 
        onCancel={() => setShowPasteModal(false)}
        width={320}
        styles={{ padding: 0, body: { padding: 0 } }} 
        modalRender={(node) => <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-600">{node}</div>}
      >
        <div className="bg-slate-800 p-5 text-center">
          <div className="text-slate-300 font-bold mb-4 text-sm uppercase tracking-wider">Chạm giữ vào ô dưới để Dán</div>
          <Input 
            autoFocus
            className="text-center font-bold text-lg py-3 !bg-slate-900 !border-slate-600 !text-sky-400" 
            placeholder="Dán (Paste) số tiền..." 
            onChange={(e) => {
              const text = e.target.value;
              if (text) {
                const n = text.replace(/\D/g,'');
                if(n) {
                  setValStr(n);
                  setShowPasteModal(false);
                  onOk(Number(n));
                }
              }
            }}
          />
          <button className="mt-4 text-slate-400 text-xs underline hover:text-white" onClick={() => setShowPasteModal(false)}>Hủy bỏ</button>
        </div>
      </Modal>
    </Modal>
  );
}
