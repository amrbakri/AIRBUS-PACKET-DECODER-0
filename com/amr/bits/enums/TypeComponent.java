package com.amr.bits.enums;

public enum TypeComponent {
    LITERAL(BITSComponents.LITERAL_PACKET.getComponentName()),
    OPERATOR(BITSComponents.OPERATOR_PACKET.getComponentName());

    private final String componentName;

    TypeComponent(String componentName) {
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