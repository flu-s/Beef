import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        // 💡 백엔드 회원가입 API 호출 (가정: http://localhost:8080/auth/register)
        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
            // 성공 시 처리
            alert('회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } else {
            // 실패 시 처리
            const errorText = await response.text();
            alert(`회원가입 실패: ${errorText || '서버 오류'}`);
        }
    } catch (error) {
        console.error('통신 오류:', error);
        alert('서버와 통신할 수 없습니다. (백엔드 서버 8080 포트 확인)');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-stone-200 animate-fade-in-up">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">
            Hanwoo<span className="text-red-600">Vision</span> 회원가입
          </h2>
          <p className="text-stone-500">간단한 정보 입력 후 서비스를 시작하세요.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* 이름 입력 필드 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              사용자 이름
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-xl border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all sm:text-sm sm:leading-6"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* 이메일 입력 필드 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              이메일 주소
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-xl border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all sm:text-sm sm:leading-6"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              비밀번호
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all sm:text-sm sm:leading-6"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-stone-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            <CheckCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            회원가입 완료
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-stone-500">
            이미 계정이 있으신가요?
            <Link to="/login" className="font-medium text-stone-900 hover:text-stone-700 ml-1">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;