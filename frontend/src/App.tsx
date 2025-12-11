import React, { useState, useCallback, useRef } from 'react';
import { Upload, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';

import Navbar from './components/Navbar';
import RecipeList from './components/RecipeList';
import ShopList from './components/ShopList';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';

import { analyzeBeefImage } from './services/geminiService';
import type { BeefAnalysisResult, UploadState } from './types';


// --- BeefAnalysisApp 컴포넌트: 메인 페이지의 이미지 분석 로직을 담당합니다. ---
function BeefAnalysisApp() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<BeefAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    // Validate
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('이미지 파일만 업로드해주세요.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUploadState('analyzing');
    setErrorMsg('');

    try {
      const analysis = await analyzeBeefImage(selectedFile);
      setResult(analysis);
      setUploadState('result');
    } catch (err) {
      console.error(err);
      setUploadState('error');
      setErrorMsg('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const resetApp = () => {
    setFile(null);
    setPreview(null);
    setUploadState('idle');
    setResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderGradeBadge = (grade: string) => {
    const isPremium = grade.includes('++') || grade.includes('+');
    return (
      <div className={`
        inline-flex items-center justify-center px-6 py-2 rounded-full text-2xl font-black italic shadow-lg transform -skew-x-12
        ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-stone-800 text-white'}
      `}>
        <span className="skew-x-12">Grade {grade}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">

        {/* State: IDLE - Upload Area */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
                내 소고기의 <br className="md:hidden"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                  진짜 등급
                </span>을 확인하세요
              </h1>
              <p className="text-lg text-stone-600">
                AI 모델이 고기의 단면을 분석하여<br className="hidden md:inline"/>
                정확한 등급과 부위를 판별해 드립니다.
              </p>
            </div>

            <div
              className="w-full max-w-xl h-64 border-2 border-dashed border-stone-300 rounded-3xl bg-white flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all duration-300 group shadow-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-lg font-bold text-stone-700">사진 업로드 또는 드래그</p>
              <p className="text-sm text-stone-500 mt-2">JPG, PNG 파일 지원</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {/* State: ANALYZING - Scanner Effect */}
        {uploadState === 'analyzing' && preview && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-900">
              <img src={preview} alt="Scanning" className="w-full h-full object-cover" />
              {/* Scanning Overlay */}
              <div className="absolute inset-0 bg-red-900/20 z-10"></div>
              <div className="absolute inset-0 z-20 animate-scan border-b-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center z-30">
                <span className="inline-block bg-black/70 text-white px-4 py-1 rounded-full text-sm font-mono animate-pulse">
                  ANALYZING BEEF...
                </span>
              </div>
            </div>
            <p className="text-xl font-bold text-stone-700 animate-pulse">
              등급과 부위를 분석중입니다...
            </p>
          </div>
        )}

        {/* State: ERROR */}
        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="bg-red-100 p-6 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800">분석 실패</h2>
            <p className="text-stone-600 text-center max-w-md">{errorMsg}</p>
            <button
              onClick={resetApp}
              className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* State: RESULT - New Layout */}
        {uploadState === 'result' && result && (
          <div className="animate-fade-in-up space-y-8">
            {!result.isBeef ? (
               <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-3xl p-8 shadow-xl text-center">
                 <h2 className="text-3xl font-bold mb-4">🐮 소고기가 아닌 것 같아요!</h2>
                 <p className="text-lg text-stone-600 mb-8">
                   이미지에서 소고기 특성을 찾지 못했습니다.<br/>
                   더 선명한 고기 사진으로 다시 시도해주세요.
                 </p>
                 <button onClick={resetApp} className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold">다시 촬영하기</button>
               </div>
            ) : (
              <>
                {/* 1. Main Result Section (Top) */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-200">
                   <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Image Side */}
                      <div className="relative aspect-square md:aspect-auto">
                        <img src={preview!} alt="Result" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                        <div className="absolute bottom-4 left-4 md:hidden">
                           {renderGradeBadge(result.grade)}
                        </div>
                      </div>

                      {/* Info Side */}
                      <div className="p-8 flex flex-col justify-center">
                        <div className="hidden md:block mb-6">
                           {renderGradeBadge(result.grade)}
                        </div>

                        <h2 className="text-stone-500 font-bold uppercase tracking-widest text-sm mb-2">분석 결과</h2>

                        {/* ⭐⭐⭐ 수정된 UI 코드: 판정 부위 강조 ⭐⭐⭐ */}
                        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 flex items-center gap-3">
                            <span className="text-stone-700 text-4xl font-black">판정 부위</span>
                            <span className="text-stone-900 text-5xl md:text-6xl font-black">{result.cut}</span>
                        </h1>
                        {/* ⭐⭐⭐ 수정 끝 ⭐⭐⭐ */}

                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                            <span className="text-stone-500">판정 등급</span>
                            <span className="text-xl font-bold text-stone-900">{result.grade} 등급</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                            <span className="text-stone-500">육질 상태</span>
                            <span className="text-stone-900 font-medium">상세 데이터 분석 완료</span>
                          </div>
                        </div>

                        <button
                          onClick={resetApp}
                          className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="h-5 w-5" />
                          다시 분석하기
                        </button>
                      </div>
                   </div>
                </div>

                {/* 2. Recipe Section (Middle) */}
                <RecipeList recipes={result.recipes} cut={result.cut} />

                {/* 3. Shop Map Section (Bottom) */}
                <ShopList />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


// --- App 컴포넌트: 라우팅을 정의하는 최상위 컴포넌트입니다. ---
function App() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <Routes>
                <Route path="/" element={<BeefAnalysisApp />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="*" element={<div className="text-center pt-20 text-xl font-bold">404 Page Not Found</div>} />
            </Routes>
        </div>
    );
}

export default App;