package com.amr.bits.records.parser;
import com.amr.bits.enums.BITSComponents;
import java.util.Map;


public class RecordsParserError {
    public record ParserError(
        String type,
        String message,
        String input,
        BITSComponents component,
        int startSlicingIndex,
        int widthOfSlice,
        int lengthOfBITS
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "type", type,
                "message", message,
                "input", input,
                "component", component,
                "startSlicingIndex", startSlicingIndex,
                "widthOfSlice", widthOfSlice,
                "lengthOfBITS", lengthOfBITS
            );
        }
    }
}
