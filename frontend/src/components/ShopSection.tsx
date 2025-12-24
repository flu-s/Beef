import React, { useEffect, useState, useCallback } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import ShopList from "./ShopList";
import NaverMap from "./NaverMap";
import type { ButcherShop, Coordinates } from "../types";
import { fetchNearbyShops } from "../services/shopService";

const ShopSection: React.FC = () => {
  const [shops, setShops] = useState<ButcherShop[]>([]);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const updateLocation = useCallback(async () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("📍 내 위치 확보:", location);
        setCenter(location);
        
        try {
          // ✅ 내 좌표를 서비스 함수로 전달
          const data = await fetchNearbyShops(location);
          setShops(data);
        } catch (err) {
          console.error("데이터 로딩 실패:", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("위치 권한 오류:", err);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    // 데이터 구조에 따라 shop.location.lat 또는 shop.lat 확인 필요
    const lat = shop.location?.lat || (shop as any).lat;
    const lng = shop.location?.lng || (shop as any).lng;
    setCenter({ lat, lng });
  };

  if (!center && loading) return <div className="p-10 text-center">위치 정보를 찾는 중...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">내 주변 정육점</h3>
        </div>
        <button onClick={updateLocation} className="text-blue-600">
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 border bg-stone-50">
        {center && (
          <NaverMap
            center={center}
            shops={shops}
            selectedShopId={selectedShopId}
            onShopClick={handleShopClick}
          />
        )}
      </div>

      <ShopList shops={shops} selectedShopId={selectedShopId} onShopClick={handleShopClick} />
    </div>
  );
};

export default ShopSection;
