package com.amr.bits.packets;

public class LiteralPacket extends BitStreamPacket {

    public LiteralPacket(String input, int startIndex, int endIndex) {
        super(input, startIndex, endIndex);
    }

    @Override
    protected String getInput() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected int getStartIndex() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected int getEndIndex() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
