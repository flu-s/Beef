import React, { useEffect, useState } from "react";
import ShopList from "./ShopList";
import NaverMap from "./NaverMap";
import { fetchNearbyShops } from "../services/shopService";
import type { ButcherShop, Coordinates } from "../types";

const ShopSection: React.FC = () => {
  const [shops, setShops] = useState<ButcherShop[]>([]);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    console.log("📍 위치 파악 시작 (최대 1분 대기)...");

    const options: PositionOptions = {
      enableHighAccuracy: true, // 정밀도 높음
      timeout: 60000,           // 👈 1분 (60,000ms) 설정
      maximumAge: 0             // 캐시된 위치 사용 안 함
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("✅ 위치 확인 완료:", location);
        setCenter(location);
        
        try {
          // Render 서버 API 호출
          const data = await fetchNearbyShops(location);
          setShops(data);
          setStatus("success");
        } catch (error) {
          console.error("데이터 통신 에러:", error);
          setStatus("error");
        }
      },
      (err) => {
        console.error("❌ 위치 오류:", err.message);
        setStatus("error");
        if (err.code === 3) {
          alert("1분 동안 위치를 잡지 못했습니다. 네트워크 연결을 확인해주세요.");
        }
      },
      options
    );
  }, []);

  if (status === "loading") {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-stone-500 font-medium">내 주변 정육점을 찾기 위해<br/>위치 정보를 확인 중입니다 (최대 1분)...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-10 text-center border-2 border-dashed rounded-3xl bg-stone-50">
        <p className="text-stone-600 mb-4 font-medium">위치 정보를 가져올 수 없습니다.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <h3 className="text-xl font-extrabold text-stone-900">주변 정육점 추천</h3>
      </div>

      <div className="h-72 w-full mb-6 rounded-2xl overflow-hidden border-2 border-stone-50 shadow-inner">
        {center && <NaverMap center={center} shops={shops} />}
      </div>

      <ShopList 
        shops={shops} 
        onShopClick={(shop) => setCenter({ lat: shop.lat, lng: shop.lng })} 
      />
    </div>
  );
};

export default ShopSection;
