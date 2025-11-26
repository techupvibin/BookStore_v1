package com.org.bookstore_backend.security.oauth2;
import java.util.Map;

public interface OAuth2UserInfo {
    Map<String, Object> getAttributes();
    String getId();
    String getName();
    String getEmail();
    String getImageUrl();
}