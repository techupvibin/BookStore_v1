package com.org.bookstore_backend.services;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

   // @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Uploads a MultipartFile to the configured S3 bucket with a unique key.
     *
     * @param file The MultipartFile to upload.
     * @return The public URL of the uploaded file.
     * @throws IOException If an I/O error occurs during file processing.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        // Create a unique file name to prevent conflicts
        String key = UUID.randomUUID().toString() + fileExtension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        // Upload the file to S3
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL of the uploaded file
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }

    /**
     * Downloads a file from the S3 bucket and returns its content as a byte array.
     *
     * @param key The key (filename) of the object to download in S3.
     * @return A byte array containing the file's content.
     * @throws IOException If an I/O error occurs during file download.
     * @throws NoSuchKeyException If the specified key does not exist in the bucket.
     */
    public byte[] downloadFile(String key) throws IOException {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        try {
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
            byte[] content = s3Object.readAllBytes();
            s3Object.close();
            return content;
        } catch (NoSuchKeyException e) {
            throw new IOException("File not found in S3 bucket: " + key, e);
        } catch (IOException e) {
            throw new IOException("Failed to download file from S3: " + key, e);
        }

    }
}