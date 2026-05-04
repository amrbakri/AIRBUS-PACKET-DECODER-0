package com.amr.bits.slicer;
import com.amr.bits.constants.BitsSizes;
import com.amr.bits.enums.BITSComponents;
import com.amr.bits.records.accumulators.ClsLiteralPacketFlagAcc;
import com.amr.bits.records.accumulators.ClsTypeAcc;
import com.amr.bits.records.accumulators.ClsVersionAcc;
import com.amr.bits.records.bitsslicer.RecordsBITSSlicerError.BITSSlicerError;
import com.amr.bits.records.bitsslicer.RecordsBITSSlicerResults.BITSSlicerResults;
import com.amr.bits.records.bitsslicer.RecordsLiteralPacketFlagSlicer.LiteralPacketFlagSlicer;
import com.amr.bits.records.bitsslicer.RecordsOnFailureSlicerResults.OnFailureSlicerResults;
import com.amr.bits.records.bitsslicer.RecordsOnSuccessSlicerResults.OnSuccessSlicerResults;
import com.amr.bits.records.bitsslicer.RecordsTypeSlicer.TypeSlicer;
import com.amr.bits.records.bitsslicer.RecordsVersionSlicer.VersionSlicer;

public class BITSSlicer {
    private String input;
    private BITSComponents component;
    private int startIndex;
    private int widthOfSlice;
    private String sliced;
    private VersionSlicer versionSlicer;
    private TypeSlicer typeSlicer;
    private LiteralPacketFlagSlicer LiteralPacketFlagSlicer;

    // accumulators
    private ClsVersionAcc clsVersionAcc;
    private ClsTypeAcc clsTypeAcc;
    private ClsLiteralPacketFlagAcc clsLiteralPacketFlagAcc;

    //
    private BITSSlicerResults bitsSlicerResults;
    private BITSSlicerError bitsSlicerErrorIndexOutOFBound;
    private BITSSlicerError bitsSlicerErrorMagnitudeOutOFBound;
    private BITSSlicerError bitsSlicerErrorNoEnoughBits;
    private OnFailureSlicerResults onFailureSlicerDueToIndexOutOfBound;
    private OnFailureSlicerResults onFailureSlicerDueToMagnitudeOutOfBound;
    private OnFailureSlicerResults onFailureSlicerDueToNoEnoughBits;

    public BITSSlicer(String input, BITSComponents component, int startIndex, int widthOfSlice, 
    ClsVersionAcc clsVersionAcc, 
    ClsTypeAcc clsTypeAcc,
    ClsLiteralPacketFlagAcc clsLiteralPacketFlagAcc
    ) {
        if (input == null) {
            throw new IllegalArgumentException("Input to be sliced cannot be null");
        }
        if (input.isEmpty()) {
            throw new IllegalArgumentException("Input to be sliced cannot be of length less than or equal zero");
        }
        this.input = input;
        this.component = component;
        this.startIndex = startIndex;
        this.widthOfSlice = widthOfSlice;
        this.clsVersionAcc = clsVersionAcc;
        this.clsTypeAcc = clsTypeAcc;
        this.clsLiteralPacketFlagAcc = clsLiteralPacketFlagAcc;

        this.bitsSlicerErrorIndexOutOFBound = new BITSSlicerError(
            "START_INDEX_OUT_OF_BOUNDS",
            "startSlicingIndex is outside allowed range",
            this.input,
            this.component,
            this.startIndex,
            -1,
            this.input.length()
        );
        this.bitsSlicerErrorMagnitudeOutOFBound = new BITSSlicerError(
            "MAGNITUDE_OUT_OF_BOUNDS",
            "widthOfSlice is invalid",
            this.input,
            this.component,
            this.startIndex ,
            this.widthOfSlice,
            this.input.length()
        );
        this.bitsSlicerErrorNoEnoughBits = new BITSSlicerError(
                "NO_ENOUGH_BITS",
                "Requested slice exceeds available bits",
                this.input,
                this.component,
                this.startIndex,
                this.widthOfSlice,
                this.input.length()
            );
        this.onFailureSlicerDueToIndexOutOfBound = new OnFailureSlicerResults(this.bitsSlicerErrorIndexOutOFBound);
        this.onFailureSlicerDueToMagnitudeOutOfBound = new OnFailureSlicerResults(this.bitsSlicerErrorMagnitudeOutOFBound);
        this.onFailureSlicerDueToNoEnoughBits = new OnFailureSlicerResults(this.bitsSlicerErrorNoEnoughBits);
    }

    public void setStartIndex(int startIndex) {
        this.startIndex = startIndex;
    }
    public void setWidthOfSlice(int widthOfSlice) {
        this.widthOfSlice = widthOfSlice;
    }

    public BITSSlicerResults slice() {
        OnSuccessSlicerResults onSuccessSlicerResults;

        if (this.startIndex < 0 || this.startIndex > this.input.length()) {
            return new BITSSlicerResults(this.onFailureSlicerDueToIndexOutOfBound, null);
        }

        if (this.widthOfSlice > this.input.length()) {
            return new BITSSlicerResults(this.onFailureSlicerDueToMagnitudeOutOfBound, null);
        }

        if ((this.startIndex + this.widthOfSlice) > this.input.length()) {
            return new BITSSlicerResults(this.onFailureSlicerDueToNoEnoughBits, null);
        }

        switch (this.component) {
            case VERSION -> {
                this.sliced = this.input.substring(this.startIndex, (BitsSizes.VERSION + this.startIndex));
                this.clsVersionAcc.setSlicedInput(this.sliced);
                this.clsVersionAcc.add();

                this.versionSlicer = new VersionSlicer(
                    this.input,
                    this.component,
                    this.startIndex,
                    this.widthOfSlice,
                    this.input.length(),
                    this.sliced,
                    (this.startIndex + this.widthOfSlice),
                    this.clsVersionAcc.getTotalBinary(),
                    this.clsVersionAcc.getTotalDecimal(),
                    this.clsVersionAcc.getQueueOfBinaries(),
                    this.clsVersionAcc.getQueueOfDecimals(),
                    this.clsVersionAcc.getLastBinary(),
                    this.clsVersionAcc.getLastDecimal()
                );
                onSuccessSlicerResults = new OnSuccessSlicerResults(this.versionSlicer, null, null);
                this.bitsSlicerResults =  new BITSSlicerResults(null, onSuccessSlicerResults);
                return this.bitsSlicerResults;
            }
            case TYPE -> {
                this.sliced = this.input.substring(this.startIndex, (BitsSizes.TYPE + this.startIndex));
                this.clsTypeAcc.setSlicedInput(this.sliced);
                this.clsTypeAcc.add();

                this.typeSlicer = new TypeSlicer(
                    this.input,
                    this.component,
                    this.startIndex,
                    this.widthOfSlice,
                    this.input.length(),
                    this.sliced,
                    (this.startIndex + this.widthOfSlice),
                    this.clsTypeAcc.isPacketLiteralOrOperator(this.sliced),
                    this.clsTypeAcc.getTotalBinary(),
                    this.clsTypeAcc.getTotalDecimal(),
                    this.clsTypeAcc.getQueueOfBinaries(),
                    this.clsTypeAcc.getQueueOfDecimals(),
                    this.clsTypeAcc.getLastBinary(),
                    this.clsTypeAcc.getLastDecimal()
                );
                onSuccessSlicerResults = new OnSuccessSlicerResults(null, this.typeSlicer, null);
                this.bitsSlicerResults =  new BITSSlicerResults(null, onSuccessSlicerResults);
                return this.bitsSlicerResults;
            }
            case HEADER -> {
            }
            case LITERAL_PACKET_FLAG -> {
                this.sliced = this.input.substring(this.startIndex, (BitsSizes.LITERAL_PACKET_FLAG + this.startIndex));
                this.clsLiteralPacketFlagAcc.setSlicedInput(this.sliced);
                this.clsLiteralPacketFlagAcc.add();

                this.LiteralPacketFlagSlicer = new LiteralPacketFlagSlicer(
                    this.input,
                    this.component,
                    this.startIndex,
                    this.widthOfSlice,
                    this.input.length(),
                    this.sliced,
                    (this.startIndex + this.widthOfSlice),
                    this.clsLiteralPacketFlagAcc.continueReadingPackets(sliced),
                    this.clsLiteralPacketFlagAcc.getTotalBinary(),
                    this.clsLiteralPacketFlagAcc.getTotalDecimal(),
                    this.clsLiteralPacketFlagAcc.getQueueOfBinaries(),
                    this.clsLiteralPacketFlagAcc.getQueueOfDecimals(),
                    this.clsLiteralPacketFlagAcc.getLastBinary(),
                    this.clsLiteralPacketFlagAcc.getLastDecimal()
                );
                onSuccessSlicerResults = new OnSuccessSlicerResults(null, null, this.LiteralPacketFlagSlicer);
                this.bitsSlicerResults =  new BITSSlicerResults(null, onSuccessSlicerResults);
                return this.bitsSlicerResults;
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
}
