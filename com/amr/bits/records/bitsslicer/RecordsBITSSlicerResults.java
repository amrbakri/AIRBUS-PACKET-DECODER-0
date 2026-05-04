package com.amr.bits.records.bitsslicer;
import com.amr.bits.records.bitsslicer.RecordsOnFailureSlicerResults.OnFailureSlicerResults;
import com.amr.bits.records.bitsslicer.RecordsOnSuccessSlicerResults.OnSuccessSlicerResults;
import java.util.Map;

public class RecordsBITSSlicerResults {
    public record BITSSlicerResults(
        OnFailureSlicerResults onFailure,
        OnSuccessSlicerResults onSuccess
    ) {
        public Map<String, Object> toMap() {
            return Map.of(
                "onFailure", onFailure,
                "onSuccess", onSuccess
            );
        }
    }
}