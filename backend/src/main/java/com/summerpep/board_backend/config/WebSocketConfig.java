package com.summerpep.board_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-board")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureWebSocketTransport(org.springframework.web.socket.config.annotation.WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(50 * 1024 * 1024); // 50MB
        registry.setSendBufferSizeLimit(50 * 1024 * 1024); // 50MB
        registry.setSendTimeLimit(20000); // 20s
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(new org.springframework.messaging.support.ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, org.springframework.messaging.MessageChannel channel) {
                org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor =
                        org.springframework.messaging.simp.stomp.StompHeaderAccessor.wrap(message);
                
                // Block VIEW_ONLY attempts from sending drawing events
                if (org.springframework.messaging.simp.stomp.StompCommand.SEND.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination != null && destination.startsWith("/app/draw/")) {
                        String accessType = accessor.getFirstNativeHeader("accessType");
                        if ("VIEW_ONLY".equals(accessType)) {
                            // Block message
                            return null;
                        }
                    }
                }
                return message;
            }
        });
    }
}
