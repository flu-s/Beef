import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 가져오기

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext의 login 함수 사용

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        // ⭐⭐⭐ 핵심 수정: localStorage 접근에 try-catch 적용 ⭐⭐⭐
        try {
            // 이 부분이 오류를 발생시키는 부분입니다.
            localStorage.setItem('token', token);
            console.log('로그인 성공! JWT 토큰 저장됨.'); // Login.tsx:32 (이 줄에서 로그가 출력될 것입니다)
        } catch (storageError) {
            console.warn('경고: localStorage 접근이 차단되었습니다. (시크릿 모드 가능성)', storageError);
            // Storage에 저장 실패해도, Context에만 성공적으로 등록하고 진행합니다.
        }
        // ⭐⭐⭐ 핵심 수정 끝 ⭐⭐⭐

        // AuthContext 상태 업데이트 (메모리 로그인)
        login(token);

        navigate('/'); // 홈으로 이동
      } else {
        const errorData = await response.json();
        setError(errorData.message || '로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('서버 연결 오류 또는 기타 문제 발생');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-stone-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-stone-900">로그인</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">이메일</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">비밀번호</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            로그인
          </button>
        </form>

        <p className="text-center text-sm text-stone-600">
          계정이 없으신가요? <a onClick={() => navigate('/register')} className="text-red-600 hover:text-red-700 cursor-pointer font-medium">회원가입</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;