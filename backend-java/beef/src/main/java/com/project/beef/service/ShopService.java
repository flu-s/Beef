package com.project.beef.service;

import com.project.beef.dto.ShopResponse;
import java.util.List;

public interface ShopService {
    List<ShopResponse> searchButcherShops(double lat, double lng);
}