import React, { useEffect, useState, useCallback } from "react";
import { MapPin, RefreshCw, AlertCircle } from "lucide-react";
import ShopList from "./ShopList";
import NaverMap from "./NaverMap";
import type { ButcherShop, Coordinates } from "../types";
import { fetchNearbyShops } from "../services/shopService";

const ShopSection: React.FC = () => {
  const [shops, setShops] = useState<ButcherShop[]>([]);
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("📍 실시간 내 위치 확보 성공:", location);
        setCenter(location);
        
        try {
          const data = await fetchNearbyShops(location);
          setShops(data);
        } catch (err) {
          console.error("데이터 로딩 실패:", err);
          setError("주변 정육점 정보를 가져오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn("위치 오류 발생:", err.message);
        // ✅ 여기서 기본 좌표(수원역 등)를 설정하던 로직을 완전히 제거했습니다.
        setError("위치 권한이 거부되었거나 위치를 찾을 수 없습니다.");
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, // GPS 우선 사용
        timeout: 15000,           // 충분한 대기 시간 설정
        maximumAge: 0 
      }
    );
  }, []);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  const handleShopClick = (shop: ButcherShop) => {
    setSelectedShopId(shop.id);
    if (shop.location) {
      setCenter({ lat: shop.location.lat, lng: shop.location.lng });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">내 주변 정육점 지도</h3>
        </div>
        <button
          onClick={updateLocation}
          disabled={loading}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          내 위치로 갱신
        </button>
      </div>

      {/* 지도 영역 */}
      <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 border border-stone-200 shadow-inner bg-stone-50 flex items-center justify-center">
        {center ? (
          <NaverMap
            center={center}
            shops={shops}
            selectedShopId={selectedShopId}
            onShopClick={handleShopClick}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {error ? (
              <>
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-stone-500 text-sm">{error}</p>
                <button onClick={updateLocation} className="text-xs text-blue-600 underline">다시 시도</button>
              </>
            ) : (
              <p className="text-stone-400 text-sm animate-pulse">실제 내 위치를 확인하는 중...</p>
            )}
          </div>
        )}
      </div>

      {/* 리스트 영역 */}
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onShopClick={handleShopClick}
      />
    </div>
  );
};

export default ShopSection;
