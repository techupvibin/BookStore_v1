package com.org.bookstore_backend.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
@Configuration
public class AwsConfig {

    // Inject the access key from application.yml or environment variable
    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    // Inject the secret key from application.yml or environment variable
    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    // Inject the region from application.yml or environment variable
    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public S3Client s3Client() {
        // Create AWS basic credentials using the injected access and secret keys
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        // Create a static credentials provider
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(credentials);

        // Build the S3Client, providing the region and the credentials provider
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider).build() ;
    }
}