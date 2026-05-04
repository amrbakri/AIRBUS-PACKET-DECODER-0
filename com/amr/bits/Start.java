package com.amr.bits;
import com.amr.bits.constants.BitsSizes;
import com.amr.bits.constants.PacketsValues;
import com.amr.bits.enums.BITSComponents;
import com.amr.bits.parser.Parser;
import com.amr.bits.records.accumulators.ClsLiteralPacketFlagAcc;
import com.amr.bits.records.accumulators.ClsTypeAcc;
import com.amr.bits.records.accumulators.ClsVersionAcc;
import com.amr.bits.records.bitsslicer.RecordsBITSSlicerResults.BITSSlicerResults;
import com.amr.bits.utils.DetectBase;
import com.amr.bits.utils.LiteralPacketOrchestrator;
import java.util.logging.Logger;

public class Start {

    private static final Logger logger = Logger.getLogger(Start.class.getName());
    private static final ClsVersionAcc CLS_VERSION_ACC = new ClsVersionAcc(BitsSizes.VERSION);
    private static final ClsTypeAcc CLS_TYPE_ACC = new ClsTypeAcc(BitsSizes.TYPE);
    private static final ClsLiteralPacketFlagAcc Cls_LITERAL_PACKET_FLAG = new ClsLiteralPacketFlagAcc(BitsSizes.LITERAL_PACKET_FLAG);

    public static void main(String[] args) {
        String input = DetectBase.detectBase(
            // "0b 010 100 1 111 101 0 101 110 1 000 111 1"
            "0b 010 100 1 111 100 0 101 100 1 000 100 1"
        );
        logger.info(() -> "input type:" + input.getClass().getSimpleName());
        logger.info(() -> "input: " + input);
        Start.parseBITSStream(input);
    }

    private static void parseBITSStream(String input) {
        int nextIndex = 0;
        int numOfPacketsRead = -1;
        LiteralPacketOrchestrator literalPacketOrchestrator = null;

        while (nextIndex < input.length() &&
                (literalPacketOrchestrator == null ||
                numOfPacketsRead < literalPacketOrchestrator.getNumOfLitralPacketsToReadBeforeStop())) {

            if (numOfPacketsRead != -1) ++numOfPacketsRead;

            BITSSlicerResults version = Start.step(input, BITSComponents.VERSION, nextIndex, BitsSizes.VERSION);
            logger.info(() -> "version: " + version + "\n");

            if (version == null) return;
            BITSSlicerResults type = Start.step(input, BITSComponents.TYPE, version.onSuccess().versionSlicer().nextIndex(), BitsSizes.TYPE);
            logger.info(() -> "type: " + type + "\n");

            if (type == null) return;
            if (type.onSuccess().typeSlicer().upcomingPacketType().equals(BITSComponents.LITERAL_PACKET.toString())) {
                BITSSlicerResults literalPacketFlag = Start.step(input, BITSComponents.LITERAL_PACKET_FLAG, type.onSuccess().typeSlicer().nextIndex(), BitsSizes.LITERAL_PACKET_FLAG);
                logger.info(() -> "literalPacketFlag: " + literalPacketFlag + "\n");

                if (literalPacketFlag == null) return;
                if (!literalPacketFlag.onSuccess().LiteralPacketFlagSlicer().continueReadingPackets()) {
                    literalPacketOrchestrator = new LiteralPacketOrchestrator(PacketsValues.LITERAL_PACKET_TO_READ_BEFORE_STOP);
                    numOfPacketsRead = 0;
                }
                nextIndex = literalPacketFlag.onSuccess().LiteralPacketFlagSlicer().nextIndex();
            } else {
                
            }
        }
    }

    private static BITSSlicerResults parseComponent(
        String input,
        BITSComponents component,
        int startIndex,
        int size
    ) {

        Parser parser = new Parser(input, component, startIndex, size, input.length(), CLS_VERSION_ACC, CLS_TYPE_ACC, Cls_LITERAL_PACKET_FLAG);
        return parser.parse();
    }

    private static BITSSlicerResults step(
        String input,
        BITSComponents component,
        int index,
        int size
    ) {
        BITSSlicerResults result = parseComponent(input, component, index, size);

        if (hasError(result) || isNextIndexOutOfBound(input, result)) {
            return null;
        }
        return result;
    }

    private static boolean hasError(BITSSlicerResults result) {
        if (result == null) return true;

        var failure = result.onFailure();
        if (failure == null) return false;

        return failure.bitsSlicerError() != null;
    }
    private static boolean isNextIndexOutOfBound(String input, BITSSlicerResults result) {
        if (result == null) return true;

        var success = result.onSuccess();
        if (success == null) return false;

        var version = success.versionSlicer();
        if (version == null) return false;

        return version.nextIndex() > input.length();
    }
}