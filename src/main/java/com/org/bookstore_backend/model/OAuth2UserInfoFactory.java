package com.org.bookstore_backend.model;

import com.org.bookstore_backend.security.oauth2.OAuth2AuthenticationProcessingException;
import com.org.bookstore_backend.security.oauth2.OAuth2UserInfo;
import com.org.bookstore_backend.security.oauth2.user.FacebookOAuth2UserInfo;
import com.org.bookstore_backend.security.oauth2.user.GithubOAuth2UserInfo;
import com.org.bookstore_backend.security.oauth2.user.GoogleOAuth2UserInfo;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("facebook")) {
            return new FacebookOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("github")) {
            return new GithubOAuth2UserInfo(attributes);
        } else {
            // Throw the custom exception
            throw new OAuth2AuthenticationProcessingException("Login with " + registrationId + " is not supported yet.");
        }
    }
}