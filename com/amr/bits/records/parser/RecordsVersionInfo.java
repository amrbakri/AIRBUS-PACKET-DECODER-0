package com.amr.bits.records.parser;
import java.util.Map;

public class RecordsVersionInfo {
    public record VersionInfo(
        int packetOrder,
        String perPacketInBinary,
        int perPacketInDecimal,
        String accInBinary,
        int accInDecimal
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "packetOrder", packetOrder,
                "perPacketInBinary", perPacketInBinary,
                "perPacketInDecimal", perPacketInDecimal,
                "accInBinary", accInBinary,
                "accInDecimal", accInDecimal
            );
        }
    }
}
