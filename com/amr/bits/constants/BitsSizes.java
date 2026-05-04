package com.amr.bits.constants;

public final class BitsSizes {

    private BitsSizes() {
    }

    public static final int VERSION = 3;
    public static final int TYPE = 3;

    public static final int HEADER = VERSION + TYPE;

    public static final int LITERAL_PACKET_FLAG = 1;
    public static final int LITERAL_PACKET_MESSAGE = 4;
    public static final int LITERAL_PACKET = LITERAL_PACKET_FLAG + LITERAL_PACKET_MESSAGE;

    public static final int LENGTH_TYPE_ID = 1;
    public static final int LENGTH_OF_UPCOMING_BITS_15 = 15;
    public static final int LENGTH_OF_UPCOMING_PACKETS_11 = 11;
}