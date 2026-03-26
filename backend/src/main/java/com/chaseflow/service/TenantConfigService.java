package com.chaseflow.service;

import com.chaseflow.domain.TenantConfig;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.repository.TenantConfigRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantConfigService {

    private final TenantConfigRepository tenantConfigRepository;
    private final TenantContext tenantContext;

    @Transactional(readOnly = true)
    public TenantConfig.ConfigData getConfig() {
        UUID tenantId = tenantContext.currentTenantId();
        return getOrCreateConfig(tenantId).getConfigData();
    }

    @Transactional
    public TenantConfig.ConfigData updateConfig(TenantConfig.ConfigData configData) {
        UUID tenantId = tenantContext.currentTenantId();
        TenantConfig tc = getOrCreateConfig(tenantId);
        tc.setConfigData(configData);
        tenantConfigRepository.save(tc);
        return tc.getConfigData();
    }

    @Transactional
    public TenantConfig.ChaseConfig updateChaseConfig(TenantConfig.ChaseConfig chaseConfig) {
        UUID tenantId = tenantContext.currentTenantId();
        TenantConfig tc = getOrCreateConfig(tenantId);
        TenantConfig.ConfigData data = tc.getConfigData();
        data.setChase(chaseConfig);
        tc.setConfigData(data);
        tenantConfigRepository.save(tc);
        return chaseConfig;
    }

    public LocalDate getNextChaseDate(UUID tenantId, Temperature temperature) {
        TenantConfig tc = getOrCreateConfig(tenantId);
        int delayDays = tc.getDelayDaysForTemperature(temperature);
        return LocalDate.now().plusDays(delayDays);
    }

    public TenantConfig getOrCreateConfig(UUID tenantId) {
        return tenantConfigRepository.findByTenantId(tenantId)
                .orElseGet(() -> {
                    TenantConfig tc = TenantConfig.createDefault(tenantId);
                    return tenantConfigRepository.save(tc);
                });
    }
}
