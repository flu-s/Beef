import React, { useEffect, useRef } from "react";
import type { Coordinates, ButcherShop } from "../types";

interface NaverMapProps {
  center: Coordinates;
  shops: ButcherShop[];
  selectedShopId: number | null;
  onShopClick: (shop: ButcherShop) => void;
}

const NaverMap: React.FC<NaverMapProps> = ({ center, shops, selectedShopId, onShopClick }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // ⚠️ 중요: 네이버 객체가 없으면 아예 아무것도 하지 않음 (에러 방지)
    if (!mapElement.current || !window.naver || !window.naver.maps) {
      console.warn("Naver Maps SDK not loaded yet.");
      return;
    }

    try {
      const location = new window.naver.maps.LatLng(center.lat, center.lng);
      mapRef.current = new window.naver.maps.Map(mapElement.current, {
        center: location,
        zoom: 15,
      });
    } catch (e) {
      console.error("Map Init Error:", e);
    }
  }, [center]);

  useEffect(() => {
    // ⚠️ 여기서 LatLng을 읽으려다 에러가 났던 것이므로, 철저히 방어
    if (!mapRef.current || !window.naver || !window.naver.maps) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    shops.forEach(shop => {
      try {
        const pos = new window.naver.maps.LatLng(shop.location.lat, shop.location.lng);
        const isSelected = shop.id === selectedShopId;
        
        const marker = new window.naver.maps.Marker({
          position: pos,
          map: mapRef.current,
          icon: {
            content: `<div style="padding:5px 10px; background:${isSelected ? '#2563eb' : 'white'}; color:${isSelected ? 'white' : 'black'}; border:1px solid #ddd; border-radius:15px; font-size:12px; font-weight:bold;">🥩 ${shop.name}</div>`,
            anchor: new window.naver.maps.Point(50, 20),
          }
        });

        window.naver.maps.Event.addListener(marker, "click", () => onShopClick(shop));
        markersRef.current.push(marker);
      } catch (e) {
        console.error("Marker creation error:", e);
      }
    });
  }, [shops, selectedShopId]);

  return (
    <div className="w-full h-full relative bg-stone-100 rounded-xl overflow-hidden border">
      <div ref={mapElement} className="w-full h-full" />
      {(!window.naver || !window.naver.maps) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10 text-center p-4">
          <p className="text-gray-400 text-sm">지도 서비스를 불러올 수 없습니다.<br/>(인증 오류 또는 로딩 중)</p>
        </div>
      )}
    </div>
  );
};

export default NaverMap;
