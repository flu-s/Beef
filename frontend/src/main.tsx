// frontend/src/main.tsx 파일 내용 (최종 복구본)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  // 브라우저 저장소 접근 가능 여부를 테스트하는 함수 (오류 우회 로직)
  const isStorageAllowed = (() => {
    try {
      localStorage.setItem('test_storage_access', 'test');
      localStorage.removeItem('test_storage_access');
      return true;
    } catch (e) {
      return false;
    }
  })();

  const root = ReactDOM.createRoot(rootElement);

  if (isStorageAllowed) {
    // 저장소 접근이 가능할 때 정상 렌더링
    root.render(
      <React.StrictMode>
        {/* App을 BrowserRouter로 감싸 라우팅 기능 활성화 */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  } else {
    // 저장소 접근 불가능 시 오류 메시지를 화면에 표시하여 앱 멈춤 방지
    console.error("Browser Storage Access Error: localStorage 접근이 차단되었습니다. 브라우저 설정을 확인해주세요.");

    // 오류 메시지를 화면에 렌더링
    root.render(
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <h2>❌ 브라우저 보안 설정 오류</h2>
        <p>앱 실행이 차단되었습니다. 브라우저의 쿠키/저장소 설정을 확인해주세요.</p>
        <p>일반 창에서 접속했는지, 모든 쿠키가 허용되어 있는지 재확인해주세요.</p>
      </div>
    );
  }
}