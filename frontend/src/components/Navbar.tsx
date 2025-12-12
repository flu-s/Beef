import React from 'react';
import { Menu, User, History, Beef, LogIn, LogOut } from 'lucide-react'; // LogIn, LogOut 추가
import { Link, useNavigate } from 'react-router-dom';
// ⭐ useAuth import 추가 ⭐
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    // ⭐ Context에서 상태와 함수를 가져옴 ⭐
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout(); // Context를 통해 로그아웃 처리 (localStorage 토큰 삭제, 상태 변경)
        navigate('/'); // 로그아웃 후 메인 페이지로 이동
    };

    // ⚠️ 경고: a href="#" 링크들은 Link to="..."로 변경하여 React Router를 사용해야 합니다.
    const NavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
        <Link to={to} className="text-stone-600 hover:text-red-600 font-medium transition-colors">
            {children}
        </Link>
    );


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
                        {/* 기존 a 태그를 NavLink 컴포넌트로 교체 */}
                        <NavLink to="/">홈</NavLink>
                        {/* ⚠️ 임시 링크를 실제 라우트로 교체 필요 */}
                        <NavLink to="#">랭킹</NavLink>
                        <NavLink to="#">커뮤니티</NavLink>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-stone-500 hover:text-red-600 transition-colors rounded-full hover:bg-stone-100">
                            <History className="h-5 w-5" />
                        </button>

                        {/* ⭐⭐⭐ 핵심 수정 부분: 로그인 상태에 따라 버튼 변경 ⭐⭐⭐ */}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors shadow-lg"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>로그아웃</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>로그인</span>
                            </Link>
                        )}
                        {/* ⭐⭐⭐ 수정 끝 ⭐⭐⭐ */}

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