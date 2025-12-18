package com.project.beef.service;

import com.project.beef.dto.ShopResponse;
import java.util.List;

public interface ShopFacadeService {
    List<ShopResponse> searchNearby(double lat, double lng);
}