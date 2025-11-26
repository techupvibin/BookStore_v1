package com.org.bookstore_backend.security.oauth2.user;

import com.org.bookstore_backend.security.oauth2.OAuth2UserInfo;

import java.util.Map;

public class FacebookOAuth2UserInfo implements OAuth2UserInfo {
    // 1. A private field is needed to store the attributes.
    private Map<String, Object> attributes;

    // 2. The constructor must save the attributes.
    public FacebookOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    // 3. This method should return the stored attributes.
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getId() {
        return (String) attributes.get("id");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        if (attributes.containsKey("picture")) {
            Map<String, Object> pictureObj = (Map<String, Object>) attributes.get("picture");
            if (pictureObj.containsKey("data")) {
                Map<String, Object> dataObj = (Map<String, Object>) pictureObj.get("data");
                if (dataObj.containsKey("url")) {
                    return (String) dataObj.get("url");
                }
            }
        }
        return null;
    }
}