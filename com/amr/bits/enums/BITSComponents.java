package com.amr.bits.enums;

public enum BITSComponents {
    VERSION("version"),
    TYPE("type"),
    HEADER("header"),
    LITERAL_PACKET_FLAG("literal_packet_flag"),
    LITERAL_PACKET_MESSAGE("literal_packet_message"),
    LITERAL_PACKET("literal_packet"),
    OPERATOR_PACKET("operator_packet"),
    LENGTH_TYPE_ID("length_type_id"),
    OPERATOR_PACKET_UPCOMING_BITS_15("operator_packet_upcoming_bits_15"),
    OPERATOR_PACKET_UPCOMING_PACKETS_11("operator_packet_upcoming_packets_11");

    private final String componentName;

    BITSComponents(String componentName) {
        this.componentName = componentName;
    }

    public String getComponentName() {
        return componentName;
    }

    @Override
    public String toString() {
        return componentName;
    }
}