package com.amr.bits.records.bitsslicer;
import com.amr.bits.records.bitsslicer.RecordsBITSSlicerError.BITSSlicerError;
import java.util.Map;

public class RecordsOnFailureSlicerResults {
    public record OnFailureSlicerResults(
        BITSSlicerError bitsSlicerError
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "bitsSlicerError", bitsSlicerError
            );
        }
    }
}

