package com.amr.bits.records.accumulators;
import java.util.ArrayList;
import java.util.List;

public class ClsLiteralPacketAcc {

    private int sum = 0;
    private final StringBuilder concatenatedBinary = new StringBuilder();

    private final List<String> slicedBinaryRepr = new ArrayList<>();
    private final List<Integer> slicedDecimalRepr = new ArrayList<>();

    public void add(String binary) {
        int value = Integer.parseInt(binary, 2);

        this.sum += value;
        this.concatenatedBinary.append(binary);

        this.slicedBinaryRepr.add(binary);
        this.slicedDecimalRepr.add(value);
    }

    public int getSum() {
        return this.sum;
    }
    public String getTotalBinary() {
        return this.concatenatedBinary.toString();
    }
    public int getTotalDecimal() {
        return Integer.parseInt(this.concatenatedBinary.toString(), 2);
    }
    public List<String> getQueueOfBinaries() {
        return this.slicedBinaryRepr;
    }

    public List<Integer> getQueueOfDecimals() {
        return this.slicedDecimalRepr;
    }

    public String getLastBinary() {
        return this.slicedBinaryRepr.isEmpty() ? null :
                this.slicedBinaryRepr.get(this.slicedBinaryRepr.size() - 1);
    }

    public Integer getLastDecimal() {
        return this.slicedDecimalRepr.isEmpty() ? null :
                this.slicedDecimalRepr.get(this.slicedDecimalRepr.size() - 1);
    }
}
