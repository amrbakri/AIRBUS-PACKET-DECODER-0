package com.amr.bits.records.parser;
import java.util.Map;

public class RecordsLiteralPacketInfo {
    public record LiteralPacketInfo (
        String flag,
        String indication
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "flag", flag,
                "indication", indication
            );
        }
    }
}
