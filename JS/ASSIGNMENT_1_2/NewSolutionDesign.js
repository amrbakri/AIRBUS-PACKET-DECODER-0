const BITS_CONSTITUENTS = {
    HEADER: 'header',
    VERSION: 'version',
    TYPE: 'type',
    LITERAL_GROUP_BITS: 'literalGroupBits',
    LITERAL_GROUP_FLAG_BIT: 'literalGroupFlagBit',
    LITERAL_GROUP_MESSAGE: 'literalGroupMessage',
    LITERAL_VALUE: 'literalValue',
    LENGTH_TYPE_ID: 'lengthTypeId',
    LENGTH_BITS: 'lengthBits',
    NUM_PACKETS: 'numPackets'
};

const BITS_SIZES = {
    VERSION: 3,
    TYPE: 3,
    HEADER: 6,
    LITERAL_GROUP_BITS: 5,
    LITERAL_GROUP_FLAG_BIT: 1,
    LITERAL_GROUP_MESSAGE: 4,
    LENGTH_TYPE_ID: 1,
    LENGTH_BITS_15: 15,
    NUM_PACKETS_11: 11
};
function hexToBinary(hex) {
  return hex
    .split("")
    .map(h => parseInt(h, 16).toString(2).padStart(4, "0"))
    .join("");
}

function packetSlicer(input, startIdx, what) {
    let sliceLength;

    switch (what) {
        case BITS_CONSTITUENTS.HEADER:
            sliceLength = BITS_SIZES.HEADER;
            break;
        case BITS_CONSTITUENTS.VERSION:
            sliceLength = BITS_SIZES.VERSION;
            break;
        case BITS_CONSTITUENTS.TYPE:
            sliceLength = BITS_SIZES.TYPE;
            break;
        case BITS_CONSTITUENTS.LITERAL_GROUP_BITS:
            sliceLength = BITS_SIZES.LITERAL_GROUP_BITS;
            break;
        case BITS_CONSTITUENTS.LITERAL_GROUP_FLAG_BIT:
            sliceLength = BITS_SIZES.LITERAL_GROUP_FLAG_BIT;
            break;
        case BITS_CONSTITUENTS.LITERAL_GROUP_MESSAGE:
            sliceLength = BITS_SIZES.LITERAL_GROUP_MESSAGE;
            break;
        case BITS_CONSTITUENTS.LENGTH_TYPE_ID:
            sliceLength = BITS_SIZES.LENGTH_TYPE_ID;
            break;  
        case BITS_CONSTITUENTS.LENGTH_BITS:
            sliceLength = BITS_SIZES.LENGTH_BITS_15;
            break;
        case BITS_CONSTITUENTS.NUM_PACKETS:
            sliceLength = BITS_SIZES.NUM_PACKETS_11;
            break;    
        default:
            throw new Error("Unknown slice type");
    }

    if (startIdx + sliceLength > input.length) {
        throw new Error(`Cannot slice ${sliceLength} bits at position ${startIdx}, input length is ${input.length}`);
    }

    const binaryValue = input.slice(startIdx, startIdx + sliceLength)
    return {
        binaryValue,
        decimalRepr: parseInt(binaryValue, 2),
        startIdx,
        nextIdx_0Based: (startIdx + sliceLength),
    };
}

function sumAllVersions(packet) {
    if (!packet || packet.error) return 0;
    
    let sum = packet.version?.decimalRepr || 0;
    
    if (packet.subPackets && Array.isArray(packet.subPackets)) {
        for (const subPacket of packet.subPackets) {
            sum += sumAllVersions(subPacket);
        }
    }
    
    return sum;
}

function applyPacketOperator(packet) {

    // literalPackets do not contain operators
    if (packet.type.typeName === "LiteralPacket") {
      return {
        type: "literal",
        value: packet.literalGroupMsgDecimalRepr
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
  
    switch (packet.type.decimalRepr) {
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
        if (values.length !== 2) {
          throw new Error(`Operator 'greaterThan' expects exactly 2 operands, got ${values.length}`);
        }
        operator = "greaterThan";
  
        result = values[0] > values[1] ? 1 : 0;
        break;
  
      case 6:
        if (values.length !== 2) {
          throw new Error(`Operator 'lessThan' expects exactly 2 operands, got ${values.length}`);
        }
        operator = "lessThan";
  
        result = values[0] < values[1] ? 1 : 0;
        break;
  
      case 7:
        if (values.length !== 2) {
          throw new Error(`Operator 'equal' expects exactly 2 operands, got ${values.length}`);
        }
        operator = "equal";
  
        result = values[0] === values[1] ? 1 : 0;
        break;
  
      default:
        throw new Error("Unknown packetTypeId/OperatorId: " + packet.decimalRepr);
    }
  
    return {
      type: "operation",
      operator,
      operands: values,
      result,
      children: evaluatedChildren 
    };
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

const input = detectBase(
    // "0b 111 011 1 00000000011 010 100 0 0001 100 100 1 0010 001 100 0 0011 1 000"
    // "0x A0016C880162017C3686B18A3D4780"
    "0x 220D62004EF14266BBC5AB7A824C9C1802B360760094CE7601339D8347E20020264D0804CA95C33E006EA00085C678F31B80010B88319E1A1802D8010D4BC268927FF5EFE7B9C94D0C80281A00552549A7F12239C0892A04C99E1803D280F3819284A801B4CCDDAE6754FC6A7D2F89538510265A3097BDF0530057401394AEA2E33EC127EC3010060529A18B00467B7ABEE992B8DD2BA8D292537006276376799BCFBA4793CFF379D75CA1AA001B11DE6428402693BEBF3CC94A314A73B084A21739B98000010338D0A004CF4DCA4DEC80488F004C0010A83D1D2278803D1722F45F94F9F98029371ED7CFDE0084953B0AD7C633D2FF070C013B004663DA857C4523384F9F5F9495C280050B300660DC3B87040084C2088311C8010C84F1621F080513AC910676A651664698DF62EA401934B0E6003E3396B5BBCCC9921C18034200FC608E9094401C8891A234080330EE31C643004380296998F2DECA6CCC796F65224B5EBBD0003EF3D05A92CE6B1B2B18023E00BCABB4DA84BCC0480302D0056465612919584662F46F3004B401600042E1044D89C200CC4E8B916610B80252B6C2FCCE608860144E99CD244F3C44C983820040E59E654FA6A59A8498025234A471ED629B31D004A4792B54767EBDCD2272A014CC525D21835279FAD49934EDD45802F294ECDAE4BB586207D2C510C8802AC958DA84B400804E314E31080352AA938F13F24E9A8089804B24B53C872E0D24A92D7E0E2019C68061A901706A00720148C404CA08018A0051801000399B00D02A004000A8C402482801E200530058AC010BA8018C00694D4FA2640243CEA7D8028000844648D91A4001088950462BC2E600216607480522B00540010C84914E1E0002111F21143B9BFD6D9513005A4F9FC60AB40109CBB34E5D89C02C82F34413D59EA57279A42958B51006A13E8F60094EF81E66D0E737AE08"
)
function parsePacket(input, startIdx, endIdx) {
    if (input == undefined) {
        throw new Error('');
    }
    if (startIdx == undefined || endIdx == undefined) {
        throw new Error('');
    }
    if (startIdx >= endIdx) {
        throw new Error('')
    }

    let currentIdx = startIdx;
    let literalGroupBits = undefined;
    let literalGroupFlagBit = undefined;
    let literalGroupMessage = undefined;
    let literalGroupMsgAcc = "";
    let literalGroupBitsAcc = [];
    let operatorLengthTypIdBit = "";
    let operatorSubLengthInPackets = "";
    let operatorLengthTypIdBitAcc = [];
    let operatorSubLengthInPacketsAcc = [];

    if (startIdx + BITS_SIZES.HEADER > input.length) {
        return {
            header: null,
            version: null,
            type: null,
            error: "incomplete header",
            nextIdx: startIdx
        };
    }
    const header = packetSlicer(input, startIdx, BITS_CONSTITUENTS.HEADER);

    if (startIdx + BITS_SIZES.VERSION > input.length) {
        return {
            header: null,
            version: null,
            type: null,
            error: "incomplete version",
            nextIdx: startIdx
        };
    }
    const version = packetSlicer(input, startIdx, BITS_CONSTITUENTS.VERSION);

    if (version.nextIdx_0Based + BITS_SIZES.TYPE > input.length) {
        return {
            header,
            version,
            type: null,
            error: "incomplete type",
            nextIdx: version.nextIdx_0Based
        };
    }
    const type = packetSlicer(input, version.nextIdx_0Based, BITS_CONSTITUENTS.TYPE);
    
    currentIdx = type.nextIdx_0Based;

    if (type.decimalRepr === 4) {
        Object.assign(type, { typeName: 'LiteralPacket'});
    
        while (currentIdx + 5 <= input.length) {
            literalGroupBits = packetSlicer(input, currentIdx, BITS_CONSTITUENTS.LITERAL_GROUP_BITS);
            if (literalGroupBits.startIdx + BITS_SIZES.LITERAL_GROUP_FLAG_BIT > input.length) {
                console.log('no enough bits to parse literal-flag-bit')
                break;
            }
            literalGroupFlagBit = packetSlicer(input, literalGroupBits.startIdx, BITS_CONSTITUENTS.LITERAL_GROUP_FLAG_BIT);

            if (literalGroupFlagBit.nextIdx_0Based + BITS_SIZES.LITERAL_GROUP_MESSAGE > input.length) {
                console.log('no enough bits to parse LITERAL_GROUP_MESSAGE')
                break;
            }
            if (literalGroupFlagBit.decimalRepr === 0) {
                Object.assign(literalGroupFlagBit, { meaning: 'STOP'});
                literalGroupMessage = packetSlicer(input, literalGroupFlagBit.nextIdx_0Based, BITS_CONSTITUENTS.LITERAL_GROUP_MESSAGE);
                literalGroupMsgAcc += literalGroupMessage.binaryValue;
                console.log('last literalPacket at index:', currentIdx)
                literalGroupBitsAcc.push(Object.assign(literalGroupBits, {
                    literalGroupFlagBit,
                    literalGroupMessage
                }));
                currentIdx = literalGroupMessage.nextIdx_0Based
                break;
            } else {
                Object.assign(literalGroupFlagBit, { meaning: 'CONTINUE'});
                console.log('stream of literalPacket at index:', currentIdx)
                literalGroupMessage = packetSlicer(input, literalGroupFlagBit.nextIdx_0Based, BITS_CONSTITUENTS.LITERAL_GROUP_MESSAGE);
                literalGroupMsgAcc += literalGroupMessage.binaryValue;
                literalGroupBitsAcc.push(Object.assign(literalGroupBits, {
                    literalGroupFlagBit,
                    literalGroupMessage,
                    literalGroupMsgAcc,
                }));
                currentIdx = literalGroupMessage.nextIdx_0Based;
            }
        }

        return {
            header,
            version,
            type,
            literalGroupBitsAcc,
            literalGroupMsgDecimalRepr: parseInt(literalGroupMsgAcc, 2),
            nextIdx: currentIdx 
        }

    } else {
        Object.assign(type, { typeName: 'OperatorPacket'});
        if (currentIdx + BITS_SIZES.LENGTH_TYPE_ID > input.length) {
            return {
                header,
                version,
                type,
                error: "Incomplete length type ID",
                nextIdx: currentIdx
            };
        }

        operatorLengthTypIdBit = packetSlicer(input, currentIdx, BITS_CONSTITUENTS.LENGTH_TYPE_ID);
        currentIdx = operatorLengthTypIdBit.nextIdx_0Based;
        const subPackets = [];
        let nextIdx = currentIdx;
        
        if (operatorLengthTypIdBit.binaryValue === '0') {
            operatorLengthTypIdBitAcc.push(Object.assign(operatorLengthTypIdBit, { meaning: 'next 15 bits encodes the number of the upcoming bits in the packet.'}));
            console.log('operatorPacket with (15 bits) at index:', currentIdx)

            // if (currentIdx + BITS_SIZES.LENGTH_BITS_15 > input.length) {
            //     throw new Error(`Cannot read LENGTH_BITS (15 bits) at position ${currentIdx}, only ${input.length - currentIdx} bits remaining`);
            // }
            if (currentIdx + BITS_SIZES.LENGTH_BITS_15 > input.length) {
                return {
                    header,
                    version,
                    type,
                    operatorLengthTypIdBitAcc,
                    error: "Cannot read LENGTH_BITS (15 bits)",
                    nextIdx: currentIdx
                };
            }

            operatorSubLengthInPackets = packetSlicer(input, operatorLengthTypIdBit.nextIdx_0Based, BITS_CONSTITUENTS.LENGTH_BITS);
            operatorSubLengthInPacketsAcc.push(operatorSubLengthInPackets);

            const subPacketsEnd = operatorSubLengthInPackets.nextIdx_0Based + operatorSubLengthInPackets.decimalRepr;
            nextIdx = operatorSubLengthInPackets.nextIdx_0Based;
            
            while (nextIdx < subPacketsEnd && nextIdx < endIdx) {
                const subPacket = parsePacket(input, nextIdx, subPacketsEnd);
                subPackets.push(subPacket);
                nextIdx = subPacket.nextIdx;
            }
            currentIdx = nextIdx;

        } else {
            operatorLengthTypIdBitAcc.push(Object.assign(operatorLengthTypIdBit, { meaning: 'next 11 bits encodes the number of the upcoming sub-packets.'}));
            if (operatorLengthTypIdBit.nextIdx_0Based + BITS_SIZES.NUM_PACKETS_11 > input.length) {
                return {
                    header,
                    version,
                    type,
                    operatorLengthTypIdBitAcc,
                    error: "Cannot read NUM_PACKETS (11 bits)",
                    nextIdx: operatorLengthTypIdBit.nextIdx_0Based
                };
            }
            console.log('operatorPacket with (11 bits) at index:', currentIdx)
            operatorSubLengthInPackets = packetSlicer(input, operatorLengthTypIdBit.nextIdx_0Based, BITS_CONSTITUENTS.NUM_PACKETS);
            operatorSubLengthInPacketsAcc.push(operatorSubLengthInPackets);

            nextIdx = operatorSubLengthInPackets.nextIdx_0Based;
            
            for (let i = 0; i < operatorSubLengthInPackets.decimalRepr && nextIdx < endIdx; i++) {
                const subPacket = parsePacket(input, nextIdx, endIdx);
                subPackets.push(subPacket);
                nextIdx = subPacket.nextIdx;
            }
            currentIdx = nextIdx;
        }

        return {
            header,
            version,
            type,
            operatorLengthTypIdBitAcc,
            operatorSubLengthInPacketsAcc,
            subPackets,
            nextIdx: currentIdx 
        }
    }

    
}
const result = parsePacket(input, 0, input.length);
console.log(JSON.stringify(result, null, 2));

console.log('sumAllVersions:', sumAllVersions(result));
console.log("Operator:",applyPacketOperator(result).operator);
console.log("Operands:",applyPacketOperator(result).operands);
console.log("Evaluation:",applyPacketOperator(result).result);

// console.log("OperatorsResults:", JSON.stringify(applyPacketOperator(result), null, 2));


