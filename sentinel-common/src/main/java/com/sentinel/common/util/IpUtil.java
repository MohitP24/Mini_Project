package com.sentinel.common.util;

import java.net.InetAddress;
import java.net.UnknownHostException;

public class IpUtil {

    public static boolean isIpInCidr(String ip, String cidr) {
        try {
            if (!cidr.contains("/")) {
                return ip.equals(cidr); // Exact match if no CIDR suffix
            }
            String[] parts = cidr.split("/");
            String network = parts[0];
            int prefix = Integer.parseInt(parts[1]);

            byte[] ipBytes = InetAddress.getByName(ip).getAddress();
            byte[] networkBytes = InetAddress.getByName(network).getAddress();

            if (ipBytes.length != networkBytes.length) return false; // IPv4 vs IPv6

            int fullBytes = prefix / 8;
            int remainingBits = prefix % 8;

            for (int i = 0; i < fullBytes; i++) {
                if (ipBytes[i] != networkBytes[i]) return false;
            }

            if (remainingBits > 0) {
                int mask = (0xFF << (8 - remainingBits)) & 0xFF;
                if ((ipBytes[fullBytes] & mask) != (networkBytes[fullBytes] & mask)) return false;
            }

            return true;
        } catch (UnknownHostException | NumberFormatException e) {
            return false;
        }
    }
}
