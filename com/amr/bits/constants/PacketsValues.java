package com.amr.bits.constants;

public final class PacketsValues {

    private PacketsValues() {
    }

    public static final int LITERAL_PACKET = 4;
    public static final int LITERAL_PACKET_FLAG_CONTINUE_READING_PACKETS = 1;
    public static final int LITERAL_PACKET_FLAG_STOP_READING_PACKETS = 0;
    public static final int LITERAL_PACKET_TO_READ_BEFORE_STOP = 1;

    public static final int LENGTH_TYPE_IS_BY_SUBSEQUENT_BITS = 0;
    public static final int LENGTH_TYPE_IS_BY_SUBSEQUENT_PACKETS = 1;
}