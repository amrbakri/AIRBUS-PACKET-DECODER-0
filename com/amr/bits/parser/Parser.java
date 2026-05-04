package com.amr.bits.parser;
import com.amr.bits.constants.BitsSizes;
import com.amr.bits.enums.BITSComponents;
import com.amr.bits.records.accumulators.ClsLiteralPacketFlagAcc;
import com.amr.bits.records.accumulators.ClsTypeAcc;
import com.amr.bits.records.accumulators.ClsVersionAcc;
import com.amr.bits.records.bitsslicer.RecordsBITSSlicerResults.BITSSlicerResults;
import com.amr.bits.records.parser.RecordsLiteralPacketInfo.LiteralPacketInfo;
import com.amr.bits.records.parser.RecordsParserError.ParserError;
import com.amr.bits.records.parser.RecordsParserInfo.ParserInfo;
import com.amr.bits.records.parser.RecordsParserResults.ParserResult;
import com.amr.bits.records.parser.RecordsParserSnapshot.ParserSnapshot;
import com.amr.bits.records.parser.RecordsTypeInfo.TypeInfo;
import com.amr.bits.records.parser.RecordsVersionInfo.VersionInfo;
import com.amr.bits.slicer.BITSSlicer;

public class Parser {

    private ClsVersionAcc clsVersionAcc;
    private ClsTypeAcc clsTypeAcc;
    private ClsLiteralPacketFlagAcc clsLiteralPacketFlag;

    private String input;
    private BITSComponents component;
    private int startSlicingIndex;
    private int widthOfSlice;
    private int lengthOfBITS;
    private String sliced;

    private BITSSlicerResults bitsSlicerResult;
    // parserRecords
    private ParserInfo info;
    private TypeInfo typeInfo;
    private VersionInfo versionInfo;
    private LiteralPacketInfo literalPacketInfo;
    private ParserError parserError;
    private ParserResult parsedResults;

    public Parser(
        String input, 
        BITSComponents component, 
        int startSlicingIndex, 
        int widthOfSlice, 
        int lengthOfBITS, 
        ClsVersionAcc clsVersionAcc, 
        ClsTypeAcc clsTypeAcc, 
        ClsLiteralPacketFlagAcc clsLiteralPacketFlag) {

        this.input = input;
        this.component = component;
        this.startSlicingIndex = startSlicingIndex;
        this.widthOfSlice = widthOfSlice;
        this.lengthOfBITS = lengthOfBITS;
        this.clsVersionAcc = clsVersionAcc;
        this.clsTypeAcc = clsTypeAcc;
        this.clsLiteralPacketFlag = clsLiteralPacketFlag;
    }

    public String getInput() {
        return input;
    }

    public BITSComponents getComponent() {
        return this.component;
    }

    public int getStartSlicingIndex() {
        return this.startSlicingIndex;
    }

    public int getWidthOfSlice() {
        return this.widthOfSlice;
    }

    public int getLengthOfBITS() {
        return this.lengthOfBITS;
    }

    public int getNextIndex() {
        return this.widthOfSlice + this.startSlicingIndex ;
    }

    public String getSliced() {
        return this.sliced;
    }

    public ParserError getError() {
        return this.parserError;
    }

    public BITSSlicerResults parse() {
        switch (component) {
            case VERSION -> {
                BITSSlicer bitsSlicer = new BITSSlicer(this.input, BITSComponents.VERSION, this.startSlicingIndex, BitsSizes.VERSION, 
                this.clsVersionAcc,
                this.clsTypeAcc,
                this.clsLiteralPacketFlag);

                bitsSlicerResult = bitsSlicer.slice();
                return bitsSlicerResult;
            }
            case TYPE -> {
                BITSSlicer bitsSlicer = new BITSSlicer(this.input, BITSComponents.TYPE, this.startSlicingIndex, BitsSizes.TYPE, 
                this.clsVersionAcc,
                this.clsTypeAcc,
                this.clsLiteralPacketFlag);

                bitsSlicerResult = bitsSlicer.slice();
                return bitsSlicerResult;
            }
            case HEADER -> {
            }
            case LITERAL_PACKET_FLAG -> {
                BITSSlicer bitsSlicer = new BITSSlicer(this.input, BITSComponents.LITERAL_PACKET_FLAG, this.startSlicingIndex, BitsSizes.LITERAL_PACKET_FLAG, 
                this.clsVersionAcc,
                this.clsTypeAcc,
                this.clsLiteralPacketFlag);

                bitsSlicerResult = bitsSlicer.slice();
                return bitsSlicerResult;
            }
            case LITERAL_PACKET_MESSAGE -> {
            }
            case LITERAL_PACKET -> {
            }
            case OPERATOR_PACKET -> {
            }
            case LENGTH_TYPE_ID -> {
            }
            case OPERATOR_PACKET_UPCOMING_BITS_15 -> {
            }
            case OPERATOR_PACKET_UPCOMING_PACKETS_11 -> {
            }
        }
        return new BITSSlicerResults(null, null);
    }

    @Override
    public String toString() {
        ParserSnapshot snapshot = new ParserSnapshot(
            input,
            component,
            startSlicingIndex,
            widthOfSlice,
            lengthOfBITS,
            sliced,
            getNextIndex(),
            parserError
        );
        return snapshot.toString();
    }
}