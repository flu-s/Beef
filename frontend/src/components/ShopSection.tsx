import React, { useState } from "react";
import ShopList from "./ShopList";
import NaverMap from "./NaverMap";
import { fetchNearbyShops } from "../services/shopService";
import type { ButcherShop, Coordinates } from "../types";
import { MapPin, RefreshCw } from "lucide-react";

const ShopSection: React.FC = () => {
  const [shops, setShops] = useState<ButcherShop[]>([]);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const findShops = () => {
    setStatus("loading");
    console.log("📍 위치 파악 시작 (최대 1분 대기)...");

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 60000, // 1분
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("✅ 위치 확인 완료:", location);
        setCenter(location);
        
        try {
          const data = await fetchNearbyShops(location);
          setShops(data);
          setStatus("success");
        } catch (error) {
          console.error("데이터 로드 중 에러 발생:", error);
          setStatus("error");
        }
      },
      (err) => {
        console.error("❌ 위치 획득 오류:", err.message);
        setStatus("error");
        if (err.code === 3) alert("위치를 잡는 데 1분이 경과했습니다. 다시 시도해 주세요.");
      },
      options
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-full text-red-600">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">주변 정육점 추천</h3>
        </div>
        {status !== "loading" && (
          <button 
            onClick={findShops}
            className="flex items-center gap-1 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
            {status === "idle" ? "내 위치로 찾기" : "다시 찾기"}
          </button>
        )}
      </div>

      {status === "idle" && (
        <div className="h-72 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
          <p className="text-stone-400 mb-2">버튼을 눌러 내 주변 상점을 확인하세요</p>
          <button onClick={findShops} className="text-blue-600 font-bold hover:underline">위치 정보 허용 필요</button>
        </div>
      )}

      {status === "loading" && (
        <div className="h-72 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border-2 border-dashed border-blue-100">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">현재 위치를 탐색 중입니다 (최대 1분)...</p>
        </div>
      )}

      {status === "error" && (
        <div className="h-72 flex flex-col items-center justify-center bg-red-50 rounded-2xl border-2 border-red-100 p-4 text-center">
          <p className="text-red-600 font-bold mb-2">데이터를 가져오지 못했습니다.</p>
          <p className="text-xs text-red-400 mb-4">서버 주소 확인 및 CORS 설정을 체크하세요.</p>
          <button onClick={findShops} className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold">재시도</button>
        </div>
      )}

      {status === "success" && center && (
        <>
          <div className="h-72 w-full mb-6 rounded-2xl overflow-hidden border-2 border-stone-50 shadow-inner">
            <NaverMap center={center} shops={shops} />
          </div>
          <ShopList 
            shops={shops} 
            onShopClick={(shop) => setCenter({ lat: shop.lat, lng: shop.lng })} 
          />
        </>
      )}
    </div>
  );
};

export default ShopSection;
