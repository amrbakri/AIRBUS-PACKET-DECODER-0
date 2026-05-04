package com.amr.bits.packets;

abstract class BitStreamPacket {

    protected String input;
    protected int startIndex;
    protected int endIndex;

    protected BitStreamPacket(String input, int startIndex, int endIndex) {
        this.input = input;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    protected String getInput() {
        return this.input;
    }
    protected int getStartIndex() {
        return this.startIndex;
    }
    protected int getEndIndex() {
        return this.endIndex;
    }

    // protected abstract String encode();
    // protected abstract long evaluate();
    // protected abstract int sumVersions();
}