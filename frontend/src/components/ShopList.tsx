import React from "react";
import { MapPin, Star, Phone, Navigation } from "lucide-react";
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
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-full">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          내 주변 우수 정육점
        </h3>
      </div>



      {/* 리스트 */}
      <div className="space-y-3">
        {shops.map((shop) => (
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
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-stone-900">{shop.name}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center text-yellow-500">
                  <Star className="h-3 w-3 fill-current mr-0.5" />
                  {shop.rating}
                </span>
                <span>|</span>
                <span>{shop.distance}</span>
                <span>|</span>
                <span className="truncate max-w-[150px]">
                  {shop.address}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {/* 전화번호 / 복사 버튼 */}
              <div className="flex gap-2 items-center">
                {shop.phone ? (
                  <div className="relative group">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-stone-100 rounded-full text-stone-600
                                 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                                    hidden group-hover:block
                                    bg-black text-white text-xs px-2 py-1 rounded shadow">
                      {shop.phone}
                    </div>
                  </div>
                ) : (
                  <button
                    disabled
                    className="p-2 bg-stone-50 rounded-full text-stone-300 cursor-not-allowed"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                )}

                {shop.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(shop.phone);
                      alert("전화번호가 복사되었습니다!");
                    }}
                    title="전화번호 복사"
                    className="p-2 bg-stone-100 rounded-full text-stone-600
                               hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    📋
                  </button>
                )}
              </div>

              {/* 지도 버튼 */}
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
      </div>
    </div>
  );
};

export default ShopList;
