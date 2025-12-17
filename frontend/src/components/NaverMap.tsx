import React, { useEffect, useRef } from "react";
import type{ Coordinates, ButcherShop } from "../types";

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

const openNaverMap = (lat: number, lng: number) => {
  const url = `https://map.naver.com/v5/?c=${lng},${lat},15,0,0,0,dh`;
  window.open(url, "_blank");
};

  useEffect(() => {
    const initMap = () => {
      if (!mapElement.current || !window.naver) return;

      const location = new window.naver.maps.LatLng(center.lat, center.lng);

      const mapOptions = {
        center: location,
        zoom: 15,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: true,
        minZoom: 6,
      };

      mapRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);

      // Add a marker for the user's current location
      new window.naver.maps.Marker({
        position: location,
        map: mapRef.current,
        icon: {
          content: `
            <div style="background-color: #3b82f6; border: 3px solid white; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
          `,
          anchor: new window.naver.maps.Point(8, 8),
        }
      });
    };

    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      // Retry if script hasn't loaded yet
      const interval = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [center]); // Re-init map if center changes significantly, or handling internally

  // Update markers when shops change
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    shops.forEach((shop) => {
      const isSelected = shop.id === selectedShopId; // ✅ 여기서 선언
        const position = new window.naver.maps.LatLng(
          shop.location.lat,
          shop.location.lng
        );

        const contentHtml = `
          < <div style="
               padding: 8px 12px;
               background: ${isSelected ? "#eff6ff" : "white"};
               border-radius: 20px;
               border: 2px solid ${isSelected ? "#2563eb" : "#e2e8f0"};
               box-shadow: ${
                 isSelected
                   ? "0 6px 12px rgba(37,99,235,0.3)"
                   : "0 4px 6px rgba(0,0,0,0.1)"
               };
               display: flex;
               flex-direction: row;
               align-items: center;
               gap: 6px;
               font-weight: bold;
               font-size: 12px;
               color: #1e293b;
               cursor: pointer;
               white-space: nowrap;          /* ✅ 줄바꿈 방지 */
               transform: ${isSelected ? "scale(1.1)" : "scale(1)"};
               transition: all 0.2s ease;
             ">
               <span style="color: ${isSelected ? "#2563eb" : "#ef4444"};">🥩</span>
               ${shop.name}
             </div>
           `;

        const marker = new window.naver.maps.Marker({
          position,
          map: mapRef.current,
          zIndex: isSelected ? 100 : 1,
          icon: {
            content: contentHtml,
            anchor: new window.naver.maps.Point(50, 40),
          },
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          onShopClick(shop);
          mapRef.current.panTo(position);
        });

        // ✅ 선택된 가게면 자동으로 지도 이동
        if (isSelected) {
          mapRef.current.panTo(position);
        }

        markersRef.current.push(marker);
      });
  }, [shops, selectedShopId, onShopClick]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
      <div ref={mapElement} className="w-full h-full bg-gray-100" />
      {!window.naver && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <p className="text-gray-500 text-sm">Loading Naver Map...</p>
        </div>
      )}
    </div>
  );
};

export default NaverMap;