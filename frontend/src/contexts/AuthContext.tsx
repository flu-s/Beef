import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Context 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  // 로그인 함수: JWT 토큰을 인자로 받아 저장
  login: (jwtToken: string) => void;
  // 로그아웃 함수: 토큰 삭제 및 상태 초기화
  logout: () => void;
}

// 2. Context 생성
// 기본값은 'undefined'로 설정하고, useAuth 훅에서 Provider 안에 있는지 확인하는 것이 모범 사례입니다.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider 컴포넌트 (실제 상태 관리 로직)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 📌 1. 앱 로드 시: Local Storage에서 토큰 확인 및 상태 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      // 토큰이 있다면 상태 복원
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  // 📌 2. 로그인 함수: 토큰 저장 및 상태 업데이트
  const login = (jwtToken: string) => {
    localStorage.setItem('jwtToken', jwtToken); // Local Storage에 저장 (세션 유지)
    setToken(jwtToken);
    setIsLoggedIn(true);
  };

  // 📌 3. 로그아웃 함수: 토큰 삭제 및 상태 초기화
  const logout = () => {
    localStorage.removeItem('jwtToken'); // Local Storage에서 삭제
    setToken(null);
    setIsLoggedIn(false);
  };

  const value = {
    isLoggedIn,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Custom Hook: Context를 사용하는 컴포넌트에서 쉽게 상태를 가져오도록 돕는 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Context Provider 외부에서 useAuth를 사용할 경우 에러 발생
    throw new Error('useAuth must be used within an AuthProvider. Check your App.tsx setup.');
  }
  return context;
};