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
        
        try {
          // 실제 데이터를 가져옵니다.
          const data = await fetchNearbyShops(location);
          setShops(data);
        } catch (err) {
          console.error("정육점 데이터를 가져오는데 실패했습니다.", err);
        }
      },
      (err) => console.error("위치 정보 오류:", err),
      { enableHighAccuracy: true } // 정확도 높임
    );
  }, []);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    // ✅ 중요: shop.lat이 아니라 shop.location.lat/lng 인지 확인 후 수정
    if (shop.location) {
      setCenter({ lat: shop.location.lat, lng: shop.location.lng });
    } else if ((shop as any).lat) {
      setCenter({ lat: (shop as any).lat, lng: (shop as any).lng });
    }
  };

  if (!center) {
    return <div className="p-6 text-center">현재 위치를 불러오는 중...</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">내 주변 정육점</h3>
        </div>

        <button
          onClick={() => window.open(`https://map.naver.com/v5/search/정육점`, "_blank")}
          className="text-sm text-gray-500 underline"
        >
          지도 크게 보기
        </button>
      </div>

      {/* 지도 */}
      <div className="w-full h-56 rounded-2xl overflow-hidden mb-6 border border-stone-200">
        <NaverMap
          center={center}
          shops={shops}
          selectedShopId={selectedShopId}
          onShopClick={handleShopClick}
        />
      </div>

      {/* 리스트 - 이 컴포넌트 내부에서 shops를 돌며 리스트를 그립니다. */}
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onShopClick={handleShopClick}
      />
    </div>
  );
};

export default ShopSection;
