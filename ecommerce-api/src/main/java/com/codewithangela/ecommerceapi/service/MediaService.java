package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.exception.FileUploadException;
import com.codewithangela.ecommerceapi.exception.UnsupportedMediaTypeException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.publicUrl}")
    private String publicUrl;

    public String uploadFile(MultipartFile file, String folder) {
        // 1. Resolve filename and content type
        String original = Optional.ofNullable(file.getOriginalFilename())
            .orElseThrow(() -> new UnsupportedMediaTypeException("Filename is missing"))
            .toLowerCase();
        String contentType = Optional.ofNullable(file.getContentType())
            .orElseThrow(() -> new UnsupportedMediaTypeException("Content-Type is unknown"));

        // 2. Validate extension is an allowed type
        String ext = getFileExtension(original);
        switch (ext) {
            case "jpg","jpeg","png","gif","avif","mp4","mov","pdf","doc","docx","txt" -> {}
            default -> throw new UnsupportedMediaTypeException("Unsupported file type: " + contentType);
        }

        // 3. Build object key
        String key = String.format("%s/%s-%s", folder, UUID.randomUUID(), original);

        // 4. Prepare S3 Put request
        PutObjectRequest req = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .build();

        // 5. Perform upload
        try {
            s3Client.putObject(req, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new FileUploadException("File upload to Amazon S3 failed", e);
        }

        return publicUrl + "/" + key;
    }

    public void deleteFile(String imageUrl) {
        String prefix = publicUrl + "/";
        String key = imageUrl.startsWith(prefix) ? imageUrl.substring(prefix.length()) : imageUrl;

        DeleteObjectRequest req = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(req);
    }

    private String getFileExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length()-1) {
            throw new IllegalArgumentException("Invalid file extension in filename: " + filename);
        }
        return filename.substring(idx+1);
    }
}
