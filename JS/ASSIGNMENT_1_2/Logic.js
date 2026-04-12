function hexToBinary(hex) {
  return hex
    .split("")
    .map(h => parseInt(h, 16).toString(2).padStart(4, "0"))
    .join("");
}

function parseLiteralPackets(binary, i) {
  const version = parseInt(binary.slice(i, i + 3), 2);
  const packetTypeId = parseInt(binary.slice(i + 3, i + 6), 2);

  i += 6;//seek 6 places (from 0 to 5) "skip the three bits for packet version, and skip the three bits for packet literal value"

  let valueBits = "";

  // fragile guard condition:  while (binary.length >= 7) {
  // solid guard condition(for input,e.g.: 0b111100): i + 5 <= binary.length
  let decimalContentInPacketStartsAtBit = null;
  while (i + 5 <= binary.length) {
    console.log("in")

    decimalContentInPacketStartsAtBit = i;
    const prefix = binary[i];
    valueBits += binary.slice(i + 1, i + 5);
    i += 5;

    if (prefix === "0") break;
  }

  return {
    type: "literalPacket",
    version,
    packetTypeId,
    decimalContentInPacket: parseInt(valueBits, 2),
    binaryContentInPacket: valueBits,
    decimalContentInPacketStartsAtBit,
    versionOfNextHeaderExistsAtBit: i
  };
}

// ----------------------------
// operator packet
// ----------------------------
function parseOperatorPackets(binary, i) {
  const version = parseInt(binary.slice(i, i + 3), 2);
  const packetTypeId = parseInt(binary.slice(i + 3, i + 6), 2);

  i += 6;

  const lengthTypeId = binary[i];
  i += 1;

  const subPackets = [];
// An operator packet contains one or more packets. To indicate which subsequent binary data represents its sub-packets,
// an operator packet can use one of two modes indicated by the bit immediately after the packet header; this is called 
// the length type ID:

  let totalLength = null;
  if (lengthTypeId === "0") {
    // If the length type ID is 0, then the next 15 bits are a number that represents the total length in bits of the sub-packets 
    // contained by this packet.
    //totalLength = number of bits occupied by ALL sub-packets
    //i = 22   <- sub-packets start
    // totalLength = 27
    // bits 22 → 49
    totalLength = parseInt(binary.slice(i, i + 15), 2);//convert binary string to deciaml
    i += 15;

    const end = i + totalLength;

    while (i < end) {
      const packet = parsePacket(binary, i);
      subPackets.push(packet);
      i = packet.versionOfNextHeaderExistsAtBit;
    }
  } else {
    // If the length type ID is 1, then the next 11 bits are a number that represents the number of sub-packets immediately contained by 
    // this packet.
    const numPackets = parseInt(binary.slice(i, i + 11), 2);
    i += 11;

    for (let k = 0; k < numPackets; k++) {
      const packet = parsePacket(binary, i);
      subPackets.push(packet);
      i = packet.versionOfNextHeaderExistsAtBit;
    }
  }

  return {
    type: "operatorPacket",
    version,
    packetTypeId,
    subPackets,
    subPacketsLen: subPackets.length,
    lengthTypeId,
    numOfBitsInSubPackets: totalLength,
    versionOfNextHeaderExistsAtBit: i,
  };
}

// -----------
// main parser
// -----------
function parsePacket(binary, i = 0) {
  const typeId = parseInt(binary.slice(i + 3, i + 6), 2);

  if (typeId === 4) {
    return parseLiteralPackets(binary, i);
  }

  return parseOperatorPackets(binary, i);
}

function applyPacketOperator(packet) {

  if (packet.type === "literalPacket") {
    return {
      type: "literal",
      value: packet.decimalContentInPacket
    };
  }

  // evaluate children first
  const evaluatedChildren = packet.subPackets.map(p => applyPacketOperator(p));

  // extract numeric values from children
  const values = evaluatedChildren.map(child =>
    child.type === "literal" ? child.value : child.result
  );
  let result;
  let operator;

  switch (packet.packetTypeId) {
    case 0:
      operator = "sum";
      result = values.reduce((a, b) => a + b, 0);
      break;

    case 1:
      operator = "product";
      result = values.reduce((a, b) => a * b, 1);
      break;

    case 2:
      operator = "min";
      result = Math.min(...values);
      break;

    case 3:
      operator = "max";
      result = Math.max(...values);
      break;

    case 5:
      operator = "greaterThan";
      result = values[0] > values[1] ? 1 : 0;
      break;

    case 6:
      operator = "lessThan";
      result = values[0] < values[1] ? 1 : 0;
      break;

    case 7:
      operator = "equal";
      result = values[0] === values[1] ? 1 : 0;
      break;

    default:
      throw new Error("Unknown packet type: " + packet.packetTypeId);
  }

  return {
    type: "operation",
    operator,
    operands: values,
    result,
    children: evaluatedChildren 
  };
}
function addVersionSum(packet) {
  let sum = packet.version;
  
  //or:   if (packet.subPackets && packet.subPackets.length > 0) { 
  if (packet.type === "operatorPacket" && packet.subPackets) {
    for (const subPacket of packet.subPackets) {
      sum += addVersionSum(subPacket);
    }
  }
  
  packet.totalVersionSum = sum;
  return sum;
}

// ----------------------------
// RUN-LOGIC "input hexa or binary here"
// special-case inputs: 
// 0x220D62004EF
// 0b111100

// 101 000 0 000000001011011 001 000 1 00000000001 011 000 1 00000000101 111 100 1 0110 110 100 0 0110 101 100 0 1100 010 100 0 1111 010 100 0 1111 0000000
// vvv ttt i         15      vvv ttt i      11     vvv ttt i     11      vvv ttt L   6  vvv ttt L  6   vvv ttt L  12  vvv ttt L  15  vvv ttt L  15                                                                                   

// 110 000 0 000000001010100 000 000 0 000000000010110 000 100 0 1010 110 100 0 1011 100 000 1 00000000010 111 100 0 1100 000 100 0 1101 000000
// vvv ttt i          15     vvv ttt i       15        vvv ttt L  10  vvv ttt L  11  vvv ttt i      11     vvv ttt L  12  vvv ttt L   13

// 001 110 0 000000000011011 110 100 0 1010 010 100 0 0001 100 100        00000
// vvv ttt i        15       vvv ttt L   10 vvv ttt L   1  vvv ttt

// special case input:
// 001 110 0 000000000011011 
// 27 bits: 110 100 1 1010 0 1010 000 001 1 0010       0000000
//          vvv ttt C  10  L  10  vvv ttt i            PADDING
// vvv ttt i        15
// ----------------------------

function detectBase(str) {
  const clean = str.replace(/\s+/g, "").trim();

  let input = null;

  if (clean.startsWith("0b")) {
    console.log("binary");
    return clean.slice(2);
  }

  if (clean.startsWith("0x")) {
    console.log("hex");
    return hexToBinary(clean.slice(2));
  }

  throw new Error("ambiguous input (Must use 0b or 0x as input-prefix");
}

const input = detectBase(
  "0x 9C0141080250320F1802104A08"
  // "0b  001 110 0 000000000011011 110 100 0 1010   0 1010 0 1 0001 001 000 0 00000"
  // "0b  001 110 0 000000000011011   110 100 1 1010   0 1010   000 001 1 0010   0 000000"
  //      001 110 0 000000000011011 | 110 100 1 1010 | 0 1010 | 000 001 1 0010 | 0 000000
)

console.log('input:',input)
const result = parsePacket(input);
addVersionSum(result);// result object will be internally mutated "call by reference"
  
console.log("===== ASSIGNMENT_1 RESULT =====");
console.log(JSON.stringify(result, null, 2));
console.log("===== END ASSIGNMENT_1 =====")

console.log("\n")

console.log("===== ASSIGNMENT_2 RESULT =====");
console.log("OperatorsResults:", JSON.stringify(applyPacketOperator(result), null, 2));
console.log("===== END ASSIGNMENT_2 =====")
