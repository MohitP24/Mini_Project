package com.sentinel.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtClaims {
    private String subject;
    private List<String> roles;
    private String issuer;
    private String email;
}
