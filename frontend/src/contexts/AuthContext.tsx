// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// ⭐⭐ 핵심 수정: 타입스크립트의 * as 구문을 사용하여 모듈을 통째로 가져와서 임포트 오류를 방지합니다. ⭐⭐
import * as jwtDecodeModule from 'jwt-decode';
// 다양한 환경에서 jwtDecode 함수를 안전하게 가져오는 로직
const jwtDecode = (jwtDecodeModule as any).jwtDecode || (jwtDecodeModule as any).default || jwtDecodeModule;

// JWT 디코딩 후 결과 객체의 최소 타입 정의
interface DecodedToken {
    exp?: number; // 만료 시간 (초 단위 Unix Timestamp)
    [key: string]: any;
}

// 1. Context 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (jwtToken: string) => void;
  logout: () => void;
  tokenExpiration: number | null;
}

// 2. Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);

  // 헬퍼 함수: 토큰을 디코딩하고 만료 시간을 설정
  const decodeAndSetExpiration = (jwtToken: string) => {
    try {
        // jwtDecode 함수를 사용하고 DecodedToken 타입으로 캐스팅합니다.
        const decodedToken = (jwtDecode as (token: string) => DecodedToken)(jwtToken);

        if (decodedToken.exp) {
            // JS Date는 밀리초를 사용하므로 1000을 곱합니다.
            setTokenExpiration(decodedToken.exp * 1000);
            return;
        }
    } catch (e) {
        console.error("토큰 디코딩 실패:", e);
    }
    setTokenExpiration(null);
  };

  // 📌 1. 앱 로드 시: Local Storage에서 토큰 확인 및 상태 복원 (저장소 접근 오류 방어)
  useEffect(() => {
    let storedToken: string | null = null;
    try {
        storedToken = localStorage.getItem('jwtToken');
    } catch (e) {
        console.error("Local Storage 접근 오류:", e);
    }

    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      decodeAndSetExpiration(storedToken);
    }
  }, []);

  // 📌 2. 로그인 함수 (저장소 접근 오류 방어)
  const login = (jwtToken: string) => {
    try {
        localStorage.setItem('jwtToken', jwtToken);
    } catch (e) {
        console.error("Local Storage 쓰기 오류:", e);
    }

    setToken(jwtToken);
    setIsLoggedIn(true);
    decodeAndSetExpiration(jwtToken);
  };

  // 📌 3. 로그아웃 함수 (저장소 접근 오류 방어)
  const logout = () => {
    try {
        localStorage.removeItem('jwtToken');
    } catch (e) {
         console.error("Local Storage 삭제 오류:", e);
    }

    setToken(null);
    setIsLoggedIn(false);
    setTokenExpiration(null);
  };

  const value = {
    isLoggedIn,
    token,
    login,
    logout,
    tokenExpiration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Check your App.tsx setup.');
  }
  return context;
};