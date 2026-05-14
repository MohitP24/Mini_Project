package com.sentinel.common.util;

public class TimestampUtil {
    public static long getNowNs() {
        return System.currentTimeMillis() * 1_000_000L + (System.nanoTime() % 1_000_000L);
    }
}
