let encoder = "";
function hexToBinary(hex) {
  return hex
    .split("")
    .map(h => parseInt(h, 16).toString(2).padStart(4, "0"))
    .join("");
}

function parseLiteralPackets(binary, i) {
  const version = parseInt(binary.slice(i, i + 3), 2);
  const packetTypeId = parseInt(binary.slice(i + 3, i + 6), 2);
  encoder += "VVVTTT"

  i += 6; //seek 6 places (from 0 to 5) "skip the three bits for packet version, and skip the three bits for packet literal value"

  let valueBits = "";

  // fragile guard condition:  while (binary.length >= 7) {
  // solid guard condition(for input,e.g.: 0b111100): i + 5 <= binary.length
  let decimalContentInPacketStartsAtBit = null;
  while (i + 5 <= binary.length) {
    decimalContentInPacketStartsAtBit = i;
    const prefix = binary[i];
    valueBits += binary.slice(i + 1, i + 5);
    i += 5;

    if (prefix === "1") {
      encoder += "F"
      encoder += "" + parseInt(valueBits, 2).toString().padStart(4, '0') + ""
    }
    else if (prefix === "0") {
      encoder += "F";
      encoder += "" + parseInt(valueBits, 2).toString().padStart(4, '0') + ""

      break;
    }
  }

  return {
    type: "literalPacket",
    version,
    packetTypeId,
    decimalContentInPacket: parseInt(valueBits, 2),
    binaryContentInPacket: valueBits,
    decimalContentInPacketStartsAtBit,
    versionOfNextPacketExistsAtBit: i,
  };
}

// ----------------------------
// operator packets
// ----------------------------
function parseOperatorPackets(binary, newPacketStartProcessingBit) {
  const version = parseInt(binary.slice(newPacketStartProcessingBit, newPacketStartProcessingBit + 3), 2);
  const packetTypeId = parseInt(binary.slice(newPacketStartProcessingBit + 3, newPacketStartProcessingBit + 6), 2);

  const headerEndedAtBit = newPacketStartProcessingBit + 5;
  encoder += "VVVTTT"
  const bodyOfPacketStartAtBit = headerEndedAtBit + 1; //seek 6 places (from 0 to 5) "skip the three bits for packet version, and skip the three bits for packet literal value"

  const lengthTypeId = binary[bodyOfPacketStartAtBit];
  let subPacketsExistAtBit = bodyOfPacketStartAtBit + 1;

  const subPackets = [];
// An operator packet contains one or more packets. To indicate which subsequent binary data represents its sub-packets,
// an operator packet can use one of two modes indicated by the bit immediately after the packet header; this is called 
// the length type ID:

  let totalLength = null;
  if (lengthTypeId === "0") {
    encoder += "i"
    // If the length type ID is 0, then the next 15 bits are a number that represents the total length in bits of the sub-packets 
    // contained by this packet.
    //totalLength = number of bits occupied by ALL sub-packets
    //i = 22   <- sub-packets start
    // totalLength = 27
    // bits 22 -> 49
    totalLength = parseInt(binary.slice(subPacketsExistAtBit, subPacketsExistAtBit + 15), 2);//convert binary string to deciaml
    subPacketsExistAtBit += 15;
    encoder += "<-----15------>";

    const end = subPacketsExistAtBit + totalLength;

    while (subPacketsExistAtBit < end) {
      const packet = parsePacket(binary, subPacketsExistAtBit);
      subPackets.push(packet);
      subPacketsExistAtBit = packet.versionOfNextPacketExistsAtBit;
    }
  } else {
    encoder += "i";
    // If the length type ID is 1, then the next 11 bits are a number that represents the number of sub-packets immediately contained by 
    // this packet.
    const numPackets = parseInt(binary.slice(subPacketsExistAtBit, subPacketsExistAtBit + 11), 2);
    subPacketsExistAtBit += 11;
    encoder += "<---11---->";


    for (let k = 0; k < numPackets; k++) {
      const packet = parsePacket(binary, subPacketsExistAtBit);
      subPackets.push(packet);
      subPacketsExistAtBit = packet.versionOfNextPacketExistsAtBit;
    }
  }

  return {
    type: "operatorPacket",
    version,
    packetTypeId,
    lengthTypeId,
    numOfBitsInSubPackets: totalLength,
    versionOfNextPacketExistsAtBit: subPacketsExistAtBit,
    subPacketsLen: subPackets.length,
    subPackets,
  };
}

function generateEncoding(packet) {
  let encoding = "VVVTTT";
  
  if (packet.type === "literalPacket") {
    return encoding + "F" + packet.decimalContentInPacket.toString(16).padStart(4, '0');
  } else {
    encoding += packet.lengthTypeId === "0" ? "i<-----15------>" : "i<---11---->";
    for (const subPacket of packet.subPackets) {
      encoding += generateEncoding(subPacket);
    }
    return encoding;
  }
}
// ------------------
// main parser
// ----------------
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

  // check for edge-condition
  if (!packet) {
    return 0;
  }

  let sum = packet.version;
  
  //or:   if (packet.subPackets && packet.subPackets.length > 0) { 
  if (packet.type === "operatorPacket" && packet.subPackets && packet.subPackets.length > 0) {
    for (const subPacket of packet.subPackets) {
      sum += addVersionSum(subPacket);
    }
  }
  
  packet.totalVersionSum = sum;
  return sum;
}

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
const input = detectBase(
  // "0x 220D62004EF14266BBC5AB7A824C9C1802B360760094CE7601339D8347E20020264D0804CA95C33E006EA00085C678F31B80010B88319E1A1802D8010D4BC268927FF5EFE7B9C94D0C80281A00552549A7F12239C0892A04C99E1803D280F3819284A801B4CCDDAE6754FC6A7D2F89538510265A3097BDF0530057401394AEA2E33EC127EC3010060529A18B00467B7ABEE992B8DD2BA8D292537006276376799BCFBA4793CFF379D75CA1AA001B11DE6428402693BEBF3CC94A314A73B084A21739B98000010338D0A004CF4DCA4DEC80488F004C0010A83D1D2278803D1722F45F94F9F98029371ED7CFDE0084953B0AD7C633D2FF070C013B004663DA857C4523384F9F5F9495C280050B300660DC3B87040084C2088311C8010C84F1621F080513AC910676A651664698DF62EA401934B0E6003E3396B5BBCCC9921C18034200FC608E9094401C8891A234080330EE31C643004380296998F2DECA6CCC796F65224B5EBBD0003EF3D05A92CE6B1B2B18023E00BCABB4DA84BCC0480302D0056465612919584662F46F3004B401600042E1044D89C200CC4E8B916610B80252B6C2FCCE608860144E99CD244F3C44C983820040E59E654FA6A59A8498025234A471ED629B31D004A4792B54767EBDCD2272A014CC525D21835279FAD49934EDD45802F294ECDAE4BB586207D2C510C8802AC958DA84B400804E314E31080352AA938F13F24E9A8089804B24B53C872E0D24A92D7E0E2019C68061A901706A00720148C404CA08018A0051801000399B00D02A004000A8C402482801E200530058AC010BA8018C00694D4FA2640243CEA7D8028000844648D91A4001088950462BC2E600216607480522B00540010C84914E1E0002111F21143B9BFD6D9513005A4F9FC60AB40109CBB34E5D89C02C82F34413D59EA57279A42958B51006A13E8F60094EF81E66D0E737AE08"
  // "0x 9C0141080250320F1802104A08"
  // "0b  001 110 0 000000000011011 110 100 0 1010   0 1010 0 1 0001 001 000 0 00000"
  // "0b  001 110 0 000000000011011   110 100 1 1010   0 1010   000 001 1 0010   0 000000"
  //      001 110 0 000000000011011 | 110 100 1 1010 | 0 1010 | 000 001 1 0010 | 0 000000
  // "0x0000000000"
  // "0x 04005AC33890"
  // "0x A0016C880162017C3686B18A3D4780"
  // "0x EE00D40C823060"

  // "0b 11101110000000001101010000001100100000100011000001100000"
  // input: 001 110 0 000000000011011 110 100 0 1010 010 100 1 0001 0 0100 0000000
  // DECOD: vvv ttt i UUUUUUUUUUUUUUU vvv ttt L LLLL vvv ttt C CCCC L LLLL

  // input: 111 011 1 00000000011 010 100 0 0001 100 100 0 0010 001 100 0 0011 00000
  // DECOD: VVV TTT i <---11----> VVV TTT F LLLL VVV TTT F LLLL VVV TTT F LLLL

  // input: 111 011 1 00000000011 010 100 0 0001 100 100 0 0010 001 100 0 0011 00000
  // DECOD: VVV TTT i <---11----> VVV TTT F 0001 VVV TTT F 0002 VVV TTT F 0003

  // "0b 00111000000000000110111101000101001010010001001000000000"
// Raw-input: 001 110 0 000000000011011 110 100 0 1010 010 100 1 0001 0 0100 0000000
// asDECODED: VVV TTT i <-----15------> VVV TTT F 0010 VVV TTT F 0001 F 0020

// "0x 220D62004EF14266BBC5AB7A824C9C1802B360760094CE7601339D8347E20020264D0804CA95C33E006EA00085C678F31B80010B88319E1A1802D8010D4BC268927FF5EFE7B9C94D0C80281A00552549A7F12239C0892A04C99E1803D280F3819284A801B4CCDDAE6754FC6A7D2F89538510265A3097BDF0530057401394AEA2E33EC127EC3010060529A18B00467B7ABEE992B8DD2BA8D292537006276376799BCFBA4793CFF379D75CA1AA001B11DE6428402693BEBF3CC94A314A73B084A21739B98000010338D0A004CF4DCA4DEC80488F004C0010A83D1D2278803D1722F45F94F9F98029371ED7CFDE0084953B0AD7C633D2FF070C013B004663DA857C4523384F9F5F9495C280050B300660DC3B87040084C2088311C8010C84F1621F080513AC910676A651664698DF62EA401934B0E6003E3396B5BBCCC9921C18034200FC608E9094401C8891A234080330EE31C643004380296998F2DECA6CCC796F65224B5EBBD0003EF3D05A92CE6B1B2B18023E00BCABB4DA84BCC0480302D0056465612919584662F46F3004B401600042E1044D89C200CC4E8B916610B80252B6C2FCCE608860144E99CD244F3C44C983820040E59E654FA6A59A8498025234A471ED629B31D004A4792B54767EBDCD2272A014CC525D21835279FAD49934EDD45802F294ECDAE4BB586207D2C510C8802AC958DA84B400804E314E31080352AA938F13F24E9A8089804B24B53C872E0D24A92D7E0E2019C68061A901706A00720148C404CA08018A0051801000399B00D02A004000A8C402482801E200530058AC010BA8018C00694D4FA2640243CEA7D8028000844648D91A4001088950462BC2E600216607480522B00540010C84914E1E0002111F21143B9BFD6D9513005A4F9FC60AB40109CBB34E5D89C02C82F34413D59EA57279A42958B51006A13E8F60094EF81E66D0E737AE08"
//---------------------------------------------------------------------------------
//-----------------------------------------------------------
// EDGE-CASES (can not be parsed)
//-----------------------------------------------------------

// "0b 001100000010010011000001010"
// "0b           001 100 0 0001 001 001 1 00000101000"
// raw-input: 001 100 0 0001 001 001 1 00000101000
// asDECODED: VVV TTT F 0001 VVV TTT F
)

// let i = 0;
// const packets = [];
// // for:while (i + 6 <= input.length) -> to validate that there is at least 6 bits reserved for the header(version+type). parseLiteralPackets() slices based on existing header
// // so, it must be checked for first.
// while (i + 6 <= input.length) {
//   // stop if remaining bits are zeros (the padding)
//   if (/^0+$/.test(input.slice(i))) break;

//   const result = parsePacket(input, i);
//   packets.push(result);
//   i = result.versionOfNextPacketExistsAtBit;
// }
//---------------------------------------------------------------------------------

// const result = parsePacket(input);


console.log('Raw-input:',input);

let i = 0;
const packets = [];
let result = undefined;
// for:while (i + 6 <= input.length) -> to validate that there is at least 6 bits reserved for the header(version+type). parseLiteralPackets() slices based on existing header
// so, it must be checked for first.
while (i + 6 <= input.length) {
  // stop if remaining bits are zeros (the padding)
  if (/^0+$/.test(input.slice(i))) break;

  result = parsePacket(input, i);
  packets.push(result);
  i = result.versionOfNextPacketExistsAtBit;
}
console.log('asENCODED:',encoder)

console.log('totalVersionSum:', addVersionSum(result));// result object will be internally mutated "call by reference"
console.log("Operator:",applyPacketOperator(result).operator);
console.log("Operands:",applyPacketOperator(result).operands);
console.log("Evaluation:",applyPacketOperator(result).result);

console.log("\n" + "=".repeat(80));
console.log("===== ASSIGNMENT_1 EXPLAIN. =====");
console.log(JSON.stringify(result, null, 2));
console.log("===== END Of ASSIGNMENT_1 =====")

console.log("\n" + "=".repeat(80));
console.log("===== ASSIGNMENT_2 EXPLAIN. =====");
console.log("OperatorsResults:", JSON.stringify(applyPacketOperator(result), null, 2));
console.log("===== END Of ASSIGNMENT_2 =====")

