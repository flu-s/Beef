import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, AlertCircle, RefreshCw, LogIn, LogOut } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom'; // ⭐ useLocation 임포트 추가

import Navbar from './components/Navbar';
import RecipeList from './components/RecipeList';
import ShopList from './components/ShopList';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';

import { analyzeBeefImage } from './services/geminiService';

import type { BeefAnalysisResult, UploadState, Recipe } from './types';

import { AuthProvider, useAuth } from './contexts/AuthContext';


function BeefAnalysisApp() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<BeefAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoggedIn } = useAuth();
  const location = useLocation(); // ⭐ 1. useLocation 훅 사용

  const getKoreanCutName = (englishCut: string): string => {
    switch (englishCut.toLowerCase()) {
      case 'chuck':
        return '목심 & 윗등심';
      case 'fillet':
        return '안심';
      case 'round':
        return '우둔살 & 설도';
      case 'flank':
        return '치맛살 & 양지';
      case 'striploin':
        return '채끝살';
      default:
        return '판정 불가';
    }
  };
  // --------------------------------------------------------

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('이미지 파일만 업로드해주세요.');
      setUploadState('error');
      return;
    }

    // 1. JWT 토큰을 localStorage에서 안전하게 가져오기 (Access to storage 에러 방지)
    let tokenToUse: string | null = null;
    try {
        const token = localStorage.getItem('jwtToken');
        tokenToUse = token || null;
    } catch (e) {
        console.warn("경고: localStorage 접근이 차단되었습니다. 비회원 분석으로 진행합니다.", e);
        tokenToUse = null;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUploadState('analyzing');
    setErrorMsg('');

    try {
      const analysis = await analyzeBeefImage(selectedFile, tokenToUse);

      const baseResult: BeefAnalysisResult = {
          ...analysis,
          grade: analysis.detectedGrade,
          cut: analysis.detectedPart,
          isBeef: analysis.isBeef || true,
          partConfidence: analysis.partConfidence || 'N/A',
          gradeConfidence: analysis.gradeConfidence || 'N/A',
          recipes: analysis.recipes || [],
      };

      const recipesFromAnalysis = baseResult.recipes || [];

      const minimumRecipes: Recipe[] = [
        { title: '추천 레시피 1', description: '데이터 없음', thumbnailUrl: '' },
        { title: '추천 레시피 2', description: '데이터 없음', thumbnailUrl: '' },
        { title: '추천 레시피 3', description: '데이터 없음', thumbnailUrl: '' },
      ];

      const recipesToUse = recipesFromAnalysis.length >= 3
                           ? recipesFromAnalysis
                           : minimumRecipes;

      const finalResult: BeefAnalysisResult = {
         ...baseResult,
         recipes: recipesToUse,
      };

      // 5. 상태 업데이트
      setResult(finalResult);
      setUploadState('result');

    } catch (err) {
      console.error("분석 로직 최종 처리 오류:", err);
      setUploadState('error');

      const errorObject = err as Error;

      let errorMessage = '분석 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';

      if (errorObject.message.includes("분석 응답 처리 중 데이터 형식 오류")) {
           errorMessage = "서버 응답 데이터 형식이 잘못되었습니다. 백엔드 CutDto와 프론트엔드 타입 정의를 확인하세요.";
      } else if (errorObject.message.includes("Access to storage")) {
           errorMessage = "분석은 완료되었으나, 브라우저 설정 문제로 결과 저장/표시에 실패했습니다. (시크릿 모드 해제 권장)";
      } else {
          errorMessage = errorObject.message || errorMessage;
      }

      setErrorMsg(errorMessage);
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

  // ⭐ 2. 로고 재클릭 시 상태 초기화 로직 추가 ⭐
  useEffect(() => {
    // location.key가 변경될 때 (즉, 현재 경로('/')를 다시 클릭했을 때) 실행됩니다.
    if (location.pathname === '/' && uploadState !== 'idle') {
        resetApp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]); // 의존성 배열에 location.key를 넣어 동일 경로 재클릭을 감지합니다.
  // ⭐ 로직 추가 끝 ⭐

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
                  부위와 등급
                </span>을 확인하세요
              </h1>
              <p className="text-lg text-stone-600">
                AI 모델이 고기의 단면을 분석하여<br className="hidden md:inline"/>
                등급과 부위를 판별해 드립니다.
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
              <img src={preview!} alt="Scanning" className="w-full h-full object-cover" />
              {/* Scanning Overlay */}
              <div className="absolute inset-0 bg-red-900/20 z-10"></div>
              <div className="absolute inset-0 z-20 animate-scan border-b-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)])]"></div>
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
                      </div>

                      <div className="p-8 flex flex-col justify-center">

                        <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-6">분석 결과</h1>

                        <div className="space-y-4 mb-8">

                          {/* 판정 부위 */}
                          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                            <span className="text-stone-500 text-lg">판정 부위</span>
                            <div className="flex flex-col items-end">
                                {/* ⭐⭐⭐ 수정됨: text-2xl -> text-xl ⭐⭐⭐ */}
                                <span className="text-xl font-bold text-stone-900">
                                    {result.cut} ({getKoreanCutName(result.cut)})
                                </span>
                                <span className="text-lg text-red-500 font-semibold mt-1">
                                    (확률: {result.partConfidence})
                                </span>
                            </div>
                          </div>

                          {/* 판정 등급 */}
                          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                            <span className="text-stone-500 text-lg">판정 등급</span>
                             <div className="flex flex-col items-end">
                                {/* ⭐⭐⭐ 수정됨: text-2xl -> text-xl ⭐⭐⭐ */}
                                <span className="text-xl font-bold text-stone-900">{result.grade} 등급</span>
                                <span className="text-lg text-red-500 font-semibold mt-1">
                                    (확률: {result.gradeConfidence})
                                </span>
                            </div>
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
        <AuthProvider>
            <div className="min-h-screen bg-stone-50 flex flex-col">
                <Navbar />

                <Routes>
                    <Route path="/" element={<BeefAnalysisApp />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="*" element={<div className="text-center pt-20 text-xl font-bold">404 Page Not Found</div>} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;