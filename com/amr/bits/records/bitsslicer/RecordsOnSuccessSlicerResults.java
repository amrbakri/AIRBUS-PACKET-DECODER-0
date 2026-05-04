package com.amr.bits.records.bitsslicer;
import com.amr.bits.records.bitsslicer.RecordsLiteralPacketFlagSlicer.LiteralPacketFlagSlicer;
import com.amr.bits.records.bitsslicer.RecordsTypeSlicer.TypeSlicer;
import com.amr.bits.records.bitsslicer.RecordsVersionSlicer.VersionSlicer;
import java.util.Map;

public class RecordsOnSuccessSlicerResults {
    public record OnSuccessSlicerResults(
        VersionSlicer versionSlicer,
        TypeSlicer typeSlicer,
        LiteralPacketFlagSlicer LiteralPacketFlagSlicer
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "versionSlicer", versionSlicer,
                "typeSlicer", typeSlicer,
                "LiteralPacketFlagSlicer", LiteralPacketFlagSlicer
            );
        }
    }
}
