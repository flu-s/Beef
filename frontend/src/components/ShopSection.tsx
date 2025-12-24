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
    // 실제 사용자의 위치를 가져옴
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("📍 실시간 내 위치 확보:", location);
        setCenter(location);
        
        // 서버 API 호출 시 내 좌표 전달
        const data = await fetchNearbyShops(location);
        setShops(data);
      },
      (err) => console.error("위치 확보 실패:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    // 선택한 상점으로 지도 중심 이동
    setCenter({ lat: shop.lat, lng: shop.lng }); 
  };

  if (!center) {
    return <div className="p-10 text-center font-bold">실제 내 위치를 불러오는 중...</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold">내 주변 정육점</h3>
        </div>
        <button
          onClick={() => window.open(`https://map.naver.com/v5/search/정육점`, "_blank")}
          className="text-sm text-gray-500 underline"
        >
          지도 크게 보기
        </button>
      </div>

      {/* 네이버 지도 영역 */}
      <div className="w-full h-56 rounded-2xl overflow-hidden mb-6">
        <NaverMap
          center={center}
          shops={shops}
          selectedShopId={selectedShopId}
          onShopClick={handleShopClick}
        />
      </div>

      {/* 5개로 고정된 상점 리스트 */}
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onShopClick={handleShopClick}
      />
    </div>
  );
};

export default ShopSection;
