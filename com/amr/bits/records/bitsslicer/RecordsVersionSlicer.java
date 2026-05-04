package com.amr.bits.records.bitsslicer;
import com.amr.bits.enums.BITSComponents;
import java.math.BigInteger;
import java.util.List;

public class RecordsVersionSlicer {
    public record VersionSlicer(
        String input,
        BITSComponents component,
        int startSlicingIndex,
        int widthOfSlice,
        int lengthOfBITS,
        String sliced,
        int nextIndex,
        String totalBinary,
        BigInteger totalDecimal,
        List<String> queueOfBinaries,
        List<Integer> queueOfDecimals,
        String lastBinary,
        Integer lastDecimal
    ) {}
}