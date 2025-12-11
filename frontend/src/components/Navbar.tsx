import React from 'react';
import { Menu, User, History, Beef } from 'lucide-react';
// 🟢 Link 컴포넌트를 임포트합니다.
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 홈 버튼을 Link 컴포넌트로 변경하여 라우팅합니다. */}
          <Link to="/" className="flex items-center cursor-pointer">
            <div className="bg-red-600 p-1.5 rounded-lg mr-2">
              <Beef className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-900">
              Hanwoo<span className="text-red-600">Vision</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {/* ⚠️ 참고: 이 'a href="#"' 링크들도 Link 컴포넌트로 변경하는 것이 좋습니다. */}
            <a href="#" className="text-stone-600 hover:text-red-600 font-medium transition-colors">홈</a>
            <a href="#" className="text-stone-600 hover:text-red-600 font-medium transition-colors">랭킹</a>
            <a href="#" className="text-stone-600 hover:text-red-600 font-medium transition-colors">커뮤니티</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-stone-500 hover:text-red-600 transition-colors rounded-full hover:bg-stone-100">
              <History className="h-5 w-5" />
            </button>
            {/* 🟢 로그인 버튼을 <Link to="/login"> 컴포넌트로 변경하여 라우팅합니다. */}
            <Link
              to="/login" // App.tsx에서 정의한 로그인 경로
              className="flex items-center space-x-2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>로그인</span>
            </Link>
            <button className="md:hidden p-2 text-stone-500">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;