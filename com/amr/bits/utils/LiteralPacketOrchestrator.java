package com.amr.bits.utils;

public class LiteralPacketOrchestrator {

    private int numOfLitralPacketsToReadBeforeStop;

    public LiteralPacketOrchestrator(int numOfLitralPacketsToReadBeforeStop) {
        this.numOfLitralPacketsToReadBeforeStop = numOfLitralPacketsToReadBeforeStop;
    }

    public int getNumOfLitralPacketsToReadBeforeStop() {
        return this.numOfLitralPacketsToReadBeforeStop;
    }
}
