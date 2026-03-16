package com.chaseflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final S3Client s3Client;

    @Value("${app.aws.s3-bucket}")
    private String bucketName;

    public String upload(MultipartFile file, Long tenantId, Long leadId) {
        String key = "tenants/" + tenantId + "/leads/" + leadId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }

        return key;
    }
}
