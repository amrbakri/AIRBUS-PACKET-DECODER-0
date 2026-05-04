package com.amr.bits.records.bitsslicer;
import com.amr.bits.enums.BITSComponents;
import java.util.Map;

public class RecordsBITSSlicerError {
    public record BITSSlicerError(
        String type,
        String message,
        String input,
        BITSComponents component,
        int startIndex,
        int widthOfSlice,
        int lengthOfBITS
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "type", type,
                "message", message,
                "input", input,
                "component", component,
                "startIndex", startIndex,
                "widthOfSlice", widthOfSlice,
                "lengthOfBITS", lengthOfBITS
            );
        }
    }
}
