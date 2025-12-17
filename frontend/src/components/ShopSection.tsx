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
      (err) => console.error(err)
    );
  }, []);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    setCenter({ lat: shop.lat, lng: shop.lng }); // ✅ 지도 중심 이동
  };

  if (!center) {
    return <div className="p-6">현재 위치 불러오는 중...</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold">내 주변 우수 정육점</h3>
        </div>

        {/* ③ 지도 크게 보기 */}
        <button
          onClick={() =>
            window.open(
              `https://map.naver.com/v5/search/정육점`,
              "_blank"
            )
          }
          className="text-sm text-gray-500 underline"
        >
          지도 크게 보기
        </button>
      </div>

      {/* 지도 */}
      <div className="w-full h-56 rounded-2xl overflow-hidden mb-6">
        <NaverMap
          center={center}
          shops={shops}
          selectedShopId={selectedShopId}
          onShopClick={handleShopClick}
        />
      </div>

      {/* 리스트 */}
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onShopClick={handleShopClick}
      />
    </div>
  );
};

export default ShopSection;
