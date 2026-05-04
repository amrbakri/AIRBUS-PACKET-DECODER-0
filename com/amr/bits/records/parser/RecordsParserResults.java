package com.amr.bits.records.parser;
import com.amr.bits.records.parser.RecordsLiteralPacketInfo.LiteralPacketInfo;
import com.amr.bits.records.parser.RecordsParserError.ParserError;
import com.amr.bits.records.parser.RecordsParserInfo.ParserInfo;
import com.amr.bits.records.parser.RecordsTypeInfo.TypeInfo;
import com.amr.bits.records.parser.RecordsVersionInfo.VersionInfo;

public class RecordsParserResults {
    public record ParserResult(
        ParserInfo parserInfo,
        VersionInfo versionInfo,
        TypeInfo typeInfo,
        LiteralPacketInfo literalPacketInfo,
        ParserError parsererror
    ) {}
}