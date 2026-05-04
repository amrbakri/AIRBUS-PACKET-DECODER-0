package com.amr.bits.records.accumulators;
import com.amr.bits.constants.BitsSizes;
import com.amr.bits.enums.TypeComponent;

public class ClsTypeAcc extends BaseAcc{

    public ClsTypeAcc(int bitsSize) {
        super(bitsSize);
    }

    public String isPacketLiteralOrOperator(String slicedInput) {
        if (slicedInput == null) {
            throw new IllegalArgumentException("slicedInput cannot be null");
        }
        if (slicedInput.length() != BitsSizes.TYPE) {
            throw new IllegalArgumentException("slicedInput length must be " + BitsSizes.TYPE + " but was " + slicedInput.length());
        }

        if (!slicedInput.matches("[01]+")) {
            throw new IllegalArgumentException("slicedInput must be a binary string containing only 0 and 1");
        }

        return Integer.parseInt(slicedInput, 2) == 4
            ? TypeComponent.LITERAL.getComponentName()
            : TypeComponent.OPERATOR.getComponentName();
    }
}