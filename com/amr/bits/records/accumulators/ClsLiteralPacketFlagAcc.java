package com.amr.bits.records.accumulators;

import com.amr.bits.constants.BitsSizes;
import com.amr.bits.constants.PacketsValues;

public class ClsLiteralPacketFlagAcc extends BaseAcc {

    public ClsLiteralPacketFlagAcc(int bitsSize) {
        super(bitsSize);
    }

    public boolean continueReadingPackets(String slicedInput) {
        if (slicedInput == null) {
            throw new IllegalArgumentException("slicedInput cannot be null");
        }
        if (slicedInput.length() != BitsSizes.LITERAL_PACKET_FLAG) {
            throw new IllegalArgumentException("slicedInput length must be " + BitsSizes.LITERAL_PACKET_FLAG + " but was " + slicedInput.length());
        }

        if (!slicedInput.matches("[01]+")) {
            throw new IllegalArgumentException("slicedInput must be a binary string containing only 0 and 1");
        }

        return Integer.parseInt(slicedInput, 2) == PacketsValues.LITERAL_PACKET_FLAG_CONTINUE_READING_PACKETS;
    }
}
