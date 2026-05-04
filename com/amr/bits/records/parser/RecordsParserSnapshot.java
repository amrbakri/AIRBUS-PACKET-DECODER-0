package com.amr.bits.records.parser;
import com.amr.bits.enums.BITSComponents;
import com.amr.bits.records.parser.RecordsParserError.ParserError;

public class RecordsParserSnapshot {
    public record ParserSnapshot(
        String input,
        BITSComponents component,
        int startSlicingIndex,
        int widthOfSlice,
        int lengthOfBITS,
        String sliced,
        int nextIndex,
        ParserError error
    ) {}
}
