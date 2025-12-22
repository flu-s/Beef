import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import RecipeList from './components/RecipeList';
import ShopSection from './components/ShopSection'; 
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import { AuthProvider } from './contexts/AuthContext';

// --- API 서비스 함수 ---
const analyzeMeatImage = async (file: File, type: 'beef' | 'chicken', token: string | null) => {
  const formData = new FormData();
  formData.append('file', file);

  // Vercel Environment Variables에 등록한 주소를 사용합니다.
  const AI_SERVER_URL = import.meta.env.VITE_AI_API_URL || 'https://ai-server-05pj.onrender.com';

  // ⚠️ 중요: 경로를 /analyze/${type}으로 통일하여 AI 서버의 route와 일치시킵니다.
  const response = await fetch(`${AI_SERVER_URL}/analyze/${type}`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `서버 응답 에러: ${response.status}`);
  }

  return await response.json();
};

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

      // AI 서버 응답 구조 매핑
      const mappedResult = {
        ...data,
        displayPart: data.detectedPart || data.detectedChickenPart,
        displayConf: data.partConfidence || 'N/A',
        recipes: data.recipes || []
      };

      setResult(mappedResult);
      setUploadState('result');
    } catch (err: any) {
      console.error("Analysis Error:", err);
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 text-center">
              어떤 <span className={meatType === 'beef' ? 'text-red-600' : 'text-orange-500'}>고기</span>인가요?
            </h1>
            <div className="flex gap-4">
              <button onClick={() => setMeatType('beef')} className={`px-10 py-4 rounded-2xl font-bold transition-all ${meatType === 'beef' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-stone-400 border'}`}>🐮 소고기</button>
              <button onClick={() => setMeatType('chicken')} className={`px-10 py-4 rounded-2xl font-bold transition-all ${meatType === 'chicken' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-stone-400 border'}`}>🐔 닭고기</button>
            </div>
            <div className="w-full max-w-xl h-64 border-2 border-dashed rounded-3xl bg-white flex flex-col items-center justify-center cursor-pointer hover:border-stone-400" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-12 w-12 text-stone-300 mb-4" />
              <p className="text-xl font-bold text-stone-700">고기 사진을 업로드하세요</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
            </div>
          </div>
        )}

        {uploadState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-900">
              <img src={preview!} className="w-full h-full object-cover" alt="preview" />
              <div className="absolute inset-0 animate-scan border-b-4 border-red-500"></div>
            </div>
            <p className="text-2xl font-bold animate-pulse text-stone-800">AI가 분석 중입니다...</p>
            <p className="text-stone-500">서버가 처음 깨어나는 데 약 1분이 소요될 수 있습니다.</p>
          </div>
        )}

        {uploadState === 'result' && result && (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-stone-200">
              <img src={preview!} className="w-full h-full object-cover" alt="result" />
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-green-500" />
                  <span className="font-bold text-stone-400">Analysis Success</span>
                </div>
                <h2 className="text-3xl font-black text-stone-900 mb-6">분석 완료</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-stone-500 font-medium">부위</span>
                    <span className="text-xl font-bold text-stone-900">{getKoreanName(result.displayPart, meatType)} ({result.displayConf})</span>
                  </div>
                  {meatType === 'beef' && (
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-stone-500 font-medium">등급</span>
                      <span className="text-xl font-bold text-red-600">{result.detectedGrade} 등급 ({result.gradeConfidence})</span>
                    </div>
                  )}
                </div>
                <button onClick={resetApp} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800">
                  <RefreshCw className="h-5 w-5" /> 다시 시도
                </button>
              </div>
            </div>
            <RecipeList recipes={result.recipes} cut={getKoreanName(result.displayPart, meatType)} meatType={meatType} />
            <ShopSection />
          </div>
        )}

        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <AlertCircle className="h-20 w-20 text-red-600" />
            <h2 className="text-3xl font-bold text-stone-800">분석 실패</h2>
            <p className="text-stone-600 text-center max-w-md">{errorMsg}</p>
            <button onClick={resetApp} className="px-10 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800">다시 시도하기</button>
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
