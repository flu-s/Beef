import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import RecipeList from './components/RecipeList';
import ShopSection from './components/ShopSection'; // 분리된 컴포넌트
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import { AuthProvider } from './contexts/AuthContext';
import type { ButcherShop } from './types';

// --- API 서비스 함수 ---
const analyzeMeatImage = async (file: File, type: 'beef' | 'chicken', token: string | null) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:8080/api/cut/analyze/${type}`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.insight || '분석 서버 응답 실패');
  return data;
};

// --- 메인 분석 컴포넌트 ---
function BeefAnalysisApp() {
  const [meatType, setMeatType] = useState<'beef' | 'chicken'>('beef');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'result' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const getKoreanName = (name: string, type: 'beef' | 'chicken') => {
    if (!name || name === '-' || name === 'N/A') return '판정 불가';
    const lowerName = name.toLowerCase().trim();
    const mapping: any = {
      leg: '닭다리', wing: '닭날개', breast: '닭가슴살', thigh: '넓적다리',
      drumstick: '닭다리', chuck: '목심', fillet: '안심', round: '우둔살',
      flank: '양지', striploin: '채끝', rib: '갈비'
    };
    return mapping[lowerName] || name;
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert("이미지 파일(JPG, PNG)만 업로드 가능합니다.");
      return;
    }

    setPreview(URL.createObjectURL(selectedFile));
    setUploadState('analyzing');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('jwtToken');
      const data = await analyzeMeatImage(selectedFile, meatType, token);

      const mappedResult = {
        ...data,
        displayPartConf: data.partConfidence || 'N/A',
        displayGradeConf: data.gradeConfidence || 'N/A',
        recipes: data.recipes && data.recipes.length > 0 ? data.recipes : [{}, {}, {}]
      };

      setResult(mappedResult);
      setUploadState('result');
    } catch (err: any) {
      setErrorMsg(err.message);
      setUploadState('error');
    }
  };

  const resetApp = () => {
    setUploadState('idle');
    setResult(null);
    setPreview(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (location.pathname === '/' && uploadState !== 'idle') resetApp();
  }, [location.key]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* IDLE 상태 */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
                어떤 <span className={meatType === 'beef' ? 'text-red-600' : 'text-orange-500'}>고기</span> 분석인가요?
              </h1>
              <div className="flex gap-4 justify-center mt-6">
                <button onClick={() => setMeatType('beef')} className={`px-8 py-3 rounded-2xl font-bold transition-all ${meatType === 'beef' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-white text-stone-400 border'}`}>🐮 소고기</button>
                <button onClick={() => setMeatType('chicken')} className={`px-8 py-3 rounded-2xl font-bold transition-all ${meatType === 'chicken' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-stone-400 border'}`}>🐔 닭고기</button>
              </div>
            </div>

            <div
              className={`w-full max-w-xl h-64 border-2 border-dashed rounded-3xl bg-white flex flex-col items-center justify-center cursor-pointer transition-all ${meatType === 'beef' ? 'hover:border-red-500' : 'hover:border-orange-500'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-stone-300 mb-4" />
              <p className="text-lg font-bold text-stone-700">{meatType === 'beef' ? '소고기' : '닭고기'} 사진 선택</p>
              <p className="text-sm text-stone-400 mt-2 font-medium">※ JPG, JPEG, PNG, WEBP 파일만 넣어주세요</p>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".jpg, .jpeg, .png"
                onChange={(e) => e.target.files && processFile(e.target.files[0])}
              />
            </div>
          </div>
        )}

        {/* ANALYZING 상태 */}
        {uploadState === 'analyzing' && preview && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-900">
              <img src={preview} className="w-full h-full object-cover" alt="scanning" />
              <div className={`absolute inset-0 animate-scan border-b-4 ${meatType === 'beef' ? 'border-red-500' : 'border-orange-500'}`}></div>
            </div>
            <p className="text-xl font-bold text-stone-700 animate-pulse">AI가 {meatType === 'beef' ? '소고기' : '닭고기'} 분석 중...</p>
          </div>
        )}

        {/* RESULT 상태 */}
        {uploadState === 'result' && result && (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-stone-200">
              <img src={preview!} className="w-full h-full object-cover" alt="result" />
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className={meatType === 'beef' ? 'text-red-600' : 'text-orange-500'} />
                  <span className="font-bold text-stone-400 uppercase tracking-tighter">{meatType} Analysis Result</span>
                </div>
                <h2 className="text-3xl font-black text-stone-900 mb-6">분석 결과</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-stone-500">판정 부위</span>
                    <div className="text-right">
                      <p className="text-xl font-bold">{getKoreanName(result.detectedPart || result.detectedChickenPart, meatType)}</p>
                      <p className={`text-sm font-semibold ${meatType === 'beef' ? 'text-red-500' : 'text-orange-500'}`}>{result.displayPartConf}</p>
                    </div>
                  </div>
                  {meatType === 'beef' && (
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-stone-500">판정 등급</span>
                      <div className="text-right">
                        <p className="text-xl font-bold">{result.detectedGrade} 등급</p>
                        <p className="text-sm text-red-500 font-semibold">{result.displayGradeConf}</p>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={resetApp} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5" /> 다시 분석하기
                </button>
              </div>
            </div>

            <RecipeList recipes={result.recipes || []} cut={getKoreanName(result.detectedPart || result.detectedChickenPart, meatType)} meatType={meatType} />

            {/* 분리된 지도 및 정육점 컴포넌트 */}
            <ShopSection />
          </div>
        )}

        {/* ERROR 상태 */}
        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <h2 className="text-2xl font-bold text-stone-800">분석 실패</h2>
            <p className="text-stone-600">{errorMsg}</p>
            <button onClick={resetApp} className="px-10 py-3 bg-stone-900 text-white rounded-xl font-bold">돌아가기</button>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<BeefAnalysisApp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<div className="text-center pt-20 text-xl font-bold">404 Not Found</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
