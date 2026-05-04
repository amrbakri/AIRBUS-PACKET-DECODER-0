package com.amr.bits.records.parser;
import com.amr.bits.enums.BITSComponents;
import java.util.Map;

public class RecordsTypeInfo {
    public record TypeInfo(
        String input,
        BITSComponents component,
        int startSlicingIndex,
        int widthOfSlice,
        int lengthOfBITS,
        String sliced,
        int nextIndex
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "input", input,
                "component", component,
                "startSlicingIndex", startSlicingIndex,
                "widthOfSlice", widthOfSlice,
                "lengthOfBITS", lengthOfBITS,
                "sliced", sliced,
                "nextIndex", nextIndex
            );
        }
    }
}
