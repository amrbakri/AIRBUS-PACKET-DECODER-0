package com.amr.bits.records.accumulators;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public class BaseAcc {
    protected String binary;
    protected int bitsSize;

    protected int sum = 0;
    protected final StringBuilder concatenatedBinary = new StringBuilder();
    protected final List<String> slicedBinaryRepr = new ArrayList<>();
    protected final List<Integer> slicedDecimalRepr = new ArrayList<>();

    protected BaseAcc(int bitsSize) {
        this.bitsSize = bitsSize;
    }
    private int parse() {
        if (this.binary.length() != this.bitsSize) {
            throw new IllegalArgumentException("length of binary input:" + this.binary + ". does not match the bitsSize:" + this.bitsSize);
        }
        return Integer.parseInt(this.binary, 2);
    }
    public void setSlicedInput(String binary) {
        this.binary = binary;
    }

    public void add() {
        int value = parse();

        this.sum += value;
        this.concatenatedBinary.append(this.binary);

        this.slicedBinaryRepr.add(this.binary);
        this.slicedDecimalRepr.add(value);
    }

    protected void beforeAdd(String binary) {
        // subclasses override if needed
    }

    protected void afterAdd(String binary, int value) {
        // subclasses override if needed
    }

    protected int getSum() {
        return this.sum;
    }
    public String getTotalBinary() {
        return this.concatenatedBinary.toString();
    }
    public BigInteger getTotalDecimal() {
        return new BigInteger(this.concatenatedBinary.toString(), 2);
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
