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
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(location);
        const data = await fetchNearbyShops(location);
        setShops(data);
      },
      (err) => console.error("위치 정보 권한 필요:", err)
    );
  }, []);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    // ✅ shop.lat 대신 shop.location.lat 사용 (타입 일관성)
    setCenter({ lat: shop.location.lat, lng: shop.location.lng });
  };

  if (!center) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-lg border text-center text-stone-500">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <MapPin className="h-8 w-8 text-stone-300" />
          <p>주변 정육점을 찾기 위해 위치 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">내 주변 정육점 지도</h3>
          </div>
          <button
            onClick={() => window.open(`https://map.naver.com/v5/search/정육점`, "_blank")}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            지도 크게 보기
          </button>
        </div>

        {/* 지도 영역 */}
        <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 border border-stone-200 shadow-inner">
          <NaverMap
            center={center}
            shops={shops}
            selectedShopId={selectedShopId}
            onShopClick={handleShopClick}
          />
        </div>

        {/* 리스트 영역 (ShopList 컴포넌트 호출) */}
        <ShopList
          shops={shops}
          selectedShopId={selectedShopId}
          onShopClick={handleShopClick}
        />
      </div>
    </div>
  );
};

export default ShopSection;
