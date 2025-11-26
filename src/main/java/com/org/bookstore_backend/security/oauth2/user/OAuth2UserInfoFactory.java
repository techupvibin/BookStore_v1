package com.org.bookstore_backend.security.oauth2.user;
import com.org.bookstore_backend.security.oauth2.OAuth2AuthenticationProcessingException;
import com.org.bookstore_backend.security.oauth2.OAuth2UserInfo;

import java.util.Map;

public class OAuth2UserInfoFactory {

    /**
     * This factory method returns the correct OAuth2UserInfo implementation
     * based on the registration ID of the OAuth2 provider.
     *
     * @param registrationId The ID of the provider (e.g., "google", "facebook").
     * @param attributes The attributes (user data) received from the provider.
     * @return A concrete implementation of OAuth2UserInfo.
     * @throws OAuth2AuthenticationProcessingException if the provider is not supported.
     */
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("facebook")) {
            return new FacebookOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("github")) {
            return new GithubOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("Login with " + registrationId + " is not supported yet.");
        }
    }
}