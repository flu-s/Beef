import React from "react";
import { MapPin, Star, Navigation } from "lucide-react"; // Phone 아이콘 제거
import type { ButcherShop } from "../types";

interface ShopListProps {
  shops: ButcherShop[];
  selectedShopId: number | null;
  onShopClick: (shop: ButcherShop) => void;
}

const ShopList: React.FC<ShopListProps> = ({
  shops,
  selectedShopId,
  onShopClick,
}) => {
  // ✅ 프론트엔드에서도 안전하게 상위 5개만 표시하도록 제한
  const displayedShops = shops.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-full">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          내 주변 정육점
        </h3>
      </div>

      {/* 리스트 */}
      <div className="space-y-3">
        {displayedShops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onShopClick(shop)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
              ${
                shop.id === selectedShopId
                  ? "border-blue-500 bg-blue-50 shadow"
                  : "border-stone-100 hover:border-blue-200 hover:bg-blue-50/30"
              }`}
          >
            {/* 정보 */}
            <div className="flex-1 min-w-0"> {/* min-w-0은 텍스트 줄임표(...)를 위해 필요 */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-stone-900">{shop.name}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center text-yellow-500">
                  <Star className="h-3 w-3 fill-current mr-0.5" />
                  {shop.rating}
                </span>
                <span>|</span>
                <span>{shop.distance}m</span>
                <span>|</span>
                <span className="truncate block">
                  {shop.address}
                </span>
              </div>
            </div>

            {/* 액션 버튼: 전화번호 제거됨 */}
            <div className="flex items-center ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://map.naver.com/v5/search/${encodeURIComponent(
                    shop.name
                  )}?c=${shop.location.lng},${shop.location.lat},15,0,0,0,dh`;
                  window.open(url, "_blank");
                }}
                className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Navigation className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {displayedShops.length === 0 && (
          <p className="text-center text-stone-400 py-10">주변에 정육점이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ShopList;