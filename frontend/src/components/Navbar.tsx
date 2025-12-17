import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Beef } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


// ⭐ ExpirationTimer 컴포넌트: 만료 시간을 계산하고 표시합니다. ⭐
const ExpirationTimer = () => {
  const { tokenExpiration, isLoggedIn, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate(); // ⭐ navigate 훅 추가

  useEffect(() => {
    if (!isLoggedIn || !tokenExpiration) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = tokenExpiration - now;

      if (difference <= 0) {
        setTimeLeft('만료됨');
        // 세션 만료 시 자동 로그아웃 실행
        logout();
        navigate('/'); // ⭐ 자동 로그아웃 후 홈으로 이동
        return;
      }

      // 남은 시간 계산 (시간, 분, 초)
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // 1초마다 업데이트

    return () => clearInterval(timer);
  }, [tokenExpiration, isLoggedIn, logout, navigate]); // ⭐ 의존성 배열에 navigate 추가

  // 로그인 상태가 아니거나 시간이 만료된 경우 표시하지 않음
  if (!isLoggedIn || !timeLeft || timeLeft === '만료됨') return null;

  // 세션 만료 시간 표시 스타일 조정
  return (
    <div className="flex flex-col items-end mr-4 text-red-600">
        <span className="text-xs font-medium whitespace-nowrap">세션 만료까지</span>
        <span className="text-lg font-bold">{timeLeft}</span>
    </div>
  );
};


// Navbar 컴포넌트
function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">

        {/* ⭐ 로고: Link to="/" 설정 유지 (정상 작동 확인) ⭐ */}
        <Link to="/" className="flex items-center">
            <div className="bg-red-600 p-1.5 rounded-lg mr-2">
                <Beef className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-stone-900">
                Meat<span className="text-red-600">Vision</span>
            </span>
        </Link>
        {/* ⭐ 로고 끝 ⭐ */}

        <div className="flex items-center">
            {/* 타이머 렌더링 위치 */}
            {isLoggedIn && <ExpirationTimer />}

            {isLoggedIn ? (
                <button
                    onClick={handleLogout}
                    className="flex items-center px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    로그아웃
                </button>
            ) : (
                <Link
                    to="/login"
                    className="flex items-center px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
                >
                    <LogIn className="h-5 w-5 mr-2" />
                    로그인
                </Link>
            )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;