package com.amr.bits.utils;

public class DetectBase {

    private DetectBase(){}
    
    public static String detectBase(String str) {
        // remove all whitespace
        String clean = str.replaceAll("\\s+", "").trim().toLowerCase();

        if (clean.startsWith("0b")) {
            return clean.substring(2);
        }

        if (clean.startsWith("0x")) {
            return hexToBinary(clean.substring(2));
        }

        throw new IllegalArgumentException(
            "Ambiguous input (must use 0b or 0x as input prefix)"
        );
    }

    public static String hexToBinary(String hex) {
        StringBuilder binary = new StringBuilder();

        for (char c : hex.toCharArray()) {
            int value = Integer.parseInt(String.valueOf(c), 16);
            String bin = Integer.toBinaryString(value);

            while (bin.length() < 4) {
                bin = "0" + bin;
            }

            binary.append(bin);
        }

        return binary.toString();
    }
}