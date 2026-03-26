package com.chaseflow.domain;

import com.chaseflow.domain.enums.Temperature;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tenant_config", uniqueConstraints = {
        @UniqueConstraint(columnNames = "tenant_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantConfig extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(name = "config", columnDefinition = "JSON", nullable = false)
    private String config;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public ConfigData getConfigData() {
        try {
            return MAPPER.readValue(config, ConfigData.class);
        } catch (JsonProcessingException e) {
            return ConfigData.defaults();
        }
    }

    public void setConfigData(ConfigData data) {
        try {
            this.config = MAPPER.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize config", e);
        }
    }

    public int getDelayDaysForTemperature(Temperature temperature) {
        ConfigData data = getConfigData();
        return switch (temperature) {
            case HOT -> data.getChase().getHotDelayDays();
            case MEDIUM -> data.getChase().getMediumDelayDays();
            case COLD -> data.getChase().getColdDelayDays();
            case DORMANT -> data.getChase().getDormantDelayDays();
        };
    }

    public static TenantConfig createDefault(UUID tenantId) {
        TenantConfig tc = new TenantConfig();
        tc.setTenantId(tenantId);
        tc.setConfigData(ConfigData.defaults());
        return tc;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ConfigData {
        @Builder.Default
        private ChaseConfig chase = ChaseConfig.defaults();
        @Builder.Default
        private EmailConfig email = new EmailConfig();

        public static ConfigData defaults() {
            return ConfigData.builder().build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChaseConfig {
        @Builder.Default
        private int hotDelayDays = 2;
        @Builder.Default
        private int mediumDelayDays = 7;
        @Builder.Default
        private int coldDelayDays = 14;
        @Builder.Default
        private int dormantDelayDays = 28;
        @Builder.Default
        private boolean useAiChaseDate = false;

        public static ChaseConfig defaults() {
            return ChaseConfig.builder().build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EmailConfig {
        private String smtpHost;
        private Integer smtpPort;
        private String signature;
    }
}
