import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import RecipeList from './components/RecipeList';
import ShopSection from './components/ShopSection'; 
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import { AuthProvider } from './contexts/AuthContext';
import type { BeefAnalysisResult } from './types';

// --- API 서비스 함수 ---
const analyzeMeatImage = async (file: File, type: 'beef' | 'chicken', token: string | null) => {
  const formData = new FormData();
  formData.append('file', file);

  // Vercel 환경 변수 우선 사용, 없으면 직접 주소 사용
  const AI_SERVER_URL = import.meta.env.VITE_AI_API_URL || 'https://ai-server-05pj.onrender.com';

  // ⚠️ 경로 수정: /api/cut 제거 -> /analyze/${type}
  const response = await fetch(`${AI_SERVER_URL}/analyze/${type}`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.insight || `분석 실패 (에러코드: ${response.status})`);
  }

  return await response.json();
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
      alert("이미지 파일만 업로드 가능합니다.");
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
        recipes: data.recipes || []
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

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight text-center">
              어떤 <span className={meatType === 'beef' ? 'text-red-600' : 'text-orange-500'}>고기</span> 분석인가요?
            </h1>
            <div className="flex gap-4">
              <button onClick={() => setMeatType('beef')} className={`px-8 py-3 rounded-2xl font-bold ${meatType === 'beef' ? 'bg-red-600 text-white' : 'bg-white border'}`}>🐮 소고기</button>
              <button onClick={() => setMeatType('chicken')} className={`px-8 py-3 rounded-2xl font-bold ${meatType === 'chicken' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>🐔 닭고기</button>
            </div>
            <div 
              className="w-full max-w-xl h-64 border-2 border-dashed rounded-3xl bg-white flex flex-col items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-stone-300 mb-4" />
              <p className="font-bold text-stone-700">사진을 업로드하여 AI 분석 시작</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
            </div>
          </div>
        )}

        {uploadState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-900">
              <img src={preview!} className="w-full h-full object-cover" alt="scanning" />
              <div className="absolute inset-0 animate-scan border-b-4 border-red-500"></div>
            </div>
            <p className="text-xl font-bold animate-pulse">AI 분석 중... (최대 1분 소요)</p>
          </div>
        )}

        {uploadState === 'result' && result && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border">
              <img src={preview!} className="w-full h-full object-cover" alt="result" />
              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-black mb-6">분석 결과</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b pb-2">
                    <span>판정 부위</span>
                    <span className="font-bold">{getKoreanName(result.detectedPart || result.detectedChickenPart, meatType)}</span>
                  </div>
                  {meatType === 'beef' && (
                    <div className="flex justify-between border-b pb-2">
                      <span>판정 등급</span>
                      <span className="font-bold">{result.detectedGrade} 등급</span>
                    </div>
                  )}
                </div>
                <button onClick={resetApp} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold">다시 분석하기</button>
              </div>
            </div>
            <RecipeList recipes={result.recipes} cut={getKoreanName(result.detectedPart || result.detectedChickenPart, meatType)} meatType={meatType} />
            <ShopSection />
          </div>
        )}

        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <h2 className="text-2xl font-bold">분석 실패</h2>
            <p className="text-stone-600 text-center">{errorMsg}</p>
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
      <Navbar />
      <Routes>
        <Route path="/" element={<BeefAnalysisApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
