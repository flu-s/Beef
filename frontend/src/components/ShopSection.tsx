import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ShopList from "./ShopList";
import NaverMap from "./NaverMap";
import type { ButcherShop, Coordinates } from "../types";
import { fetchNearbyShops } from "../services/shopService";

const ShopSection: React.FC = () => {
  const [shops, setShops] = useState<ButcherShop[]>([]);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  useEffect(() => {
    // 1. 브라우저 GPS로 실제 위치 획득
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("📍 내 실제 좌표:", location);
        setCenter(location);
        
        try {
          // 2. 서버에 내 좌표를 보내서 주변 5개 데이터를 받아옴
          const data = await fetchNearbyShops(location);
          setShops(data);
        } catch (error) {
          console.error("데이터 로딩 실패:", error);
        }
      },
      (err) => {
        console.error("위치 권한 거부 또는 오류:", err);
        alert("실제 주변 정육점을 찾으려면 위치 권한 허용이 필요합니다.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    // 선택된 상점으로 지도 중심 이동 (shop.lat, shop.lng 구조 확인 필수)
    setCenter({ lat: shop.lat, lng: shop.lng });
  };

  if (!center) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-lg border">
        <p className="animate-pulse text-stone-500 font-medium">
          사용자의 현재 위치를 탐색하고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">내 주변 정육점</h3>
        </div>
        <button
          onClick={() => window.open(`https://map.naver.com/v5/search/정육점`, "_blank")}
          className="text-xs text-stone-400 hover:text-blue-600 transition-colors"
        >
          지도 크게 보기
        </button>
      </div>

      {/* 네이버 지도 컴포넌트 */}
      <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 border border-stone-100">
        <NaverMap
          center={center}
          shops={shops}
          selectedShopId={selectedShopId}
          onShopClick={handleShopClick}
        />
      </div>

      {/* 정육점 리스트 (5개) */}
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onShopClick={handleShopClick}
      />
    </div>
  );
};

export default ShopSection;
